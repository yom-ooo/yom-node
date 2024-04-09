# YOM Miner

The public node.js implementation of the YOM Miner to support cloud gaming for the metaverse.

## Prerequisites

- Windows 10 or later
- Ubuntu 20.04 or later (if using native Linux)
- Windows Subsystem for Linux (WSL) with Ubuntu 20.04 or later (if using WSL on Windows)

## Installation

### Ubuntu (native Linux)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/yom-miner.git
   ```

2. Navigate to the project directory:
   ```bash
   cd yom-miner
   ```

3. Run the setup script:
   ```bash
   ./scripts/setup.sh
   ```

4. Install Node.js dependencies:
   ```bash
   npm install
   ```

### Windows Subsystem for Linux (WSL)

1. Install WSL on your Windows machine by following the official Microsoft documentation: [Install WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

2. Open a WSL terminal and follow the steps for Ubuntu installation above.

## Usage

1. Start the miner:
   ```bash
   npm run start -- [options]
   ```

   Available options:
   - `-k, --walletKey <key>`: Specify your wallet key. Default is an empty string.
   - `-p, --storageLocation <path>`: Specify the storage path for files. Default is "Downloads".
   - `-u, --url <url>`: Specify the URL to the space. This option is required.

   Example usage:
   ```bash
   npm run start -- -k YOUR_WALLET_KEY -u https://example.com/space
   ```

   Make sure to replace `YOUR_WALLET_KEY` with your actual wallet key and `https://example.com/space` with the actual URL to the space.

## Troubleshooting

- If you encounter any issues during installation or usage, please refer to the troubleshooting guide in the [documentation](docs/troubleshooting.md).
- If the issue persists, please file an issue on the [GitHub repository](https://github.com/yourusername/yom-miner/issues) with detailed information about the problem.

## Contributing

We welcome contributions from the community! If you'd like to contribute to the project, please follow the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).