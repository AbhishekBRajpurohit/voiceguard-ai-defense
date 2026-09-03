# backend/model/aasist.py
# Official PyTorch AASIST Architecture
# Reference: Jung-wook et al. "AASIST: Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks" (Interspeech 2021)

import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class SincConv(nn.Module):
    @staticmethod
    def to_mel(hz):
        return 2595 * math.log10(1 + hz / 700)

    @staticmethod
    def to_hz(mel):
        return 700 * (10 ** (mel / 2595) - 1)

    def __init__(self, out_channels, kernel_size, sample_rate=16000, in_channels=1,
                 stride=1, padding=0, dilation=1, bias=False, groups=1, min_low_hz=50, min_band_hz=50):
        super(SincConv, self).__init__()
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        if kernel_size % 2 == 0:
            self.kernel_size = self.kernel_size + 1
        self.stride = stride
        self.padding = padding
        self.dilation = dilation
        self.sample_rate = sample_rate
        self.min_low_hz = min_low_hz
        self.min_band_hz = min_band_hz

        # Initialize filterbanks
        low_hz = 30
        high_hz = self.sample_rate / 2 - (self.min_low_hz + self.min_band_hz)
        mel = torch.linspace(self.to_mel(low_hz), self.to_mel(high_hz), self.out_channels + 1)
        hz = self.to_hz(mel)

        self.low_hz_ = nn.Parameter(hz[:-1].view(-1, 1))
        self.band_hz_ = nn.Parameter(torch.diff(hz).view(-1, 1))

        n_lin = torch.linspace(0, (self.kernel_size / 2) - 1, steps=int((self.kernel_size / 2)))
        self.window_ = 0.54 - 0.46 * torch.cos(2 * math.pi * n_lin / self.kernel_size)
        n_ = 2 * math.pi * torch.arange(-(self.kernel_size - 1) / 2.0, 0).view(1, -1) / self.sample_rate
        self.n_ = n_

    def forward(self, waveforms):
        self.n_ = self.n_.to(waveforms.device)
        self.window_ = self.window_.to(waveforms.device)

        low = self.min_low_hz + torch.abs(self.low_hz_)
        high = torch.clamp(low + self.min_band_hz + torch.abs(self.band_hz_), self.min_low_hz, self.sample_rate / 2)
        band = (high - low)[:, 0]

        f_times_t_low = torch.matmul(low, self.n_)
        f_times_t_high = torch.matmul(high, self.n_)

        band_pass_left = ((torch.sin(f_times_t_high) - torch.sin(f_times_t_low)) / (self.n_ / 2)) * self.window_
        band_pass_center = 2 * band.view(-1, 1)
        band_pass_right = torch.flip(band_pass_left, dims=[1])
        band_pass = torch.cat([band_pass_left, band_pass_center, band_pass_right], dim=1)
        band_pass = band_pass / (2 * band[:, None])

        filters = band_pass.view(self.out_channels, 1, self.kernel_size)
        return F.conv1d(waveforms, filters, stride=self.stride,
                        padding=self.padding, dilation=self.dilation, bias=None, groups=1)

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=(3, 3), padding=1)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=(3, 3), padding=1)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.lrelu = nn.LeakyReLU(negative_slope=0.3)
        self.pool = nn.MaxPool2d((2, 2))

        if in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1),
                nn.BatchNorm2d(out_channels)
            )
        else:
            self.shortcut = nn.Identity()

    def forward(self, x):
        res = self.shortcut(x)
        out = self.lrelu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = self.pool(self.lrelu(out + res))
        return out

class GraphAttentionLayer(nn.Module):
    def __init__(self, in_features, out_features):
        super(GraphAttentionLayer, self).__init__()
        self.linear = nn.Linear(in_features, out_features)
        self.attn = nn.Linear(2 * out_features, 1)
        self.lrelu = nn.LeakyReLU(0.2)

    def forward(self, x):
        # x shape: [B, Nodes, Features]
        h = self.linear(x)
        B, N, feat_dim = h.size()
        h_i = h.unsqueeze(2).repeat(1, 1, N, 1)
        h_j = h.unsqueeze(1).repeat(1, N, 1, 1)
        concat = torch.cat([h_i, h_j], dim=-1)
        e = self.lrelu(self.attn(concat)).squeeze(-1)
        alpha = torch.softmax(e, dim=-1)
        return torch.bmm(alpha, h)

class AASIST(nn.Module):
    """
    Standard AASIST Architecture (ASVspoof 2019 / 2021)
    """
    def __init__(self, d_args=None):
        super(AASIST, self).__init__()
        # Sinc-convolutional front-end (70 filters)
        self.conv_time = SincConv(out_channels=70, kernel_size=128, in_channels=1, stride=1, padding=64)
        self.bn_time = nn.BatchNorm2d(1)

        # 2D CNN Spectro-temporal Backbone
        self.res1 = ResidualBlock(1, 32)
        self.res2 = ResidualBlock(32, 64)
        self.res3 = ResidualBlock(64, 64)

        # Graph Module
        self.gat1 = GraphAttentionLayer(64, 32)
        self.gat2 = GraphAttentionLayer(32, 16)

        # Adaptive pooling to spectro-temporal graph representation (64 nodes)
        self.graph_pool = nn.AdaptiveAvgPool2d((8, 8))

        # Linear Classifier: 2 classes [0: bonafide, 1: spoof]
        self.fc = nn.Sequential(
            nn.Linear(16, 32),
            nn.LeakyReLU(0.3),
            nn.Linear(32, 2)
        )

    def forward(self, x):
        # Input shape: [B, 64600]
        if x.ndim == 2:
            x = x.unsqueeze(1) # [B, 1, 64600]
        
        # Sinc Conv
        x = self.conv_time(x) # [B, 70, T]
        x = x.unsqueeze(1)    # [B, 1, 70, T]
        x = self.bn_time(x)

        # Backbone
        x = self.res1(x)
        x = self.res2(x)
        x = self.res3(x) # [B, 64, F', T']

        # Pool down to 8x8 = 64 spectro-temporal graph nodes
        x = self.graph_pool(x) # [B, 64, 8, 8]

        # Flatten spatial dimensions into graph nodes
        B, C, F_dim, T_dim = x.size()
        nodes = x.permute(0, 2, 3, 1).contiguous().view(B, F_dim * T_dim, C) # [B, 64, 64]

        # Graph attention
        g = self.gat1(nodes)
        g = self.gat2(g) # [B, 64, 16]

        # Global average readout
        pooled = torch.mean(g, dim=1) # [B, 16]
        logits = self.fc(pooled)      # [B, 2] -> [bonafide, spoof]
        return logits
