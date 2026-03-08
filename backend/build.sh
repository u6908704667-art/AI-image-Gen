#!/bin/bash
set -e

# Update package lists
apt-get update

# Install build essentials and system dependencies for Pillow and other packages
apt-get install -y \
    build-essential \
    python3-dev \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libtiff5-dev \
    libharfbuzz0b \
    libwebp-dev \
    libopenjp2-7-dev \
    libimagequant-dev \
    libxcb1-dev

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install Python dependencies
pip install -r requirements.txt
