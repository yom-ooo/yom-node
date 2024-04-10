# YOM Node

The public node.js implementation of the YOM Node to support cloud gaming for the metaverse.

## Prerequisites

- Windows 10 or later
- Ubuntu 20.04 or later (if using native Linux)
- Windows Subsystem for Linux (WSL) with Ubuntu 20.04 or later (if using WSL on Windows)

## Installation

### Ubuntu (native Linux)

1. Clone the repository:
   ```bash
   git clone https://github.com/yom-ooo/yom-node.git
   ```

2. Navigate to the project directory:
   ```bash
   cd yom-Node
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

1. Start the Node:
   ```bash
   npm run start
   ```

## Configuration

The following environment variables need to be set in the `.env` file:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
- `AWS_REGION`: The AWS region where your resources are located.
- `AZURE_FUNCTION_URL`: The URL of your Azure Function for sending heartbeats.
- `STORAGE_LOCATION`: The storage location for downloaded files. This can be a path independent from the project's root or disk.
- `WALLET_KEY`: Your wallet key.

Make sure to provide the appropriate values for each environment variable.

## Troubleshooting

- If you encounter any issues during installation or usage, please refer to the troubleshooting guide in the [documentation](docs/troubleshooting.md).
- If the issue persists, please file an issue on the [GitHub repository](https://github.com/yourusername/yom-Node/issues) with detailed information about the problem.

## Contributing

We welcome contributions from the community! If you'd like to contribute to the project, please follow the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).