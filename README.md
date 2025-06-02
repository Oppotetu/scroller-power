# Scroller Power

A powerful VS Code extension that enhances your scrolling experience with customizable keybindings and smooth scrolling behavior. This extension provides different scroll amounts for different keys, making navigation through your code more efficient and comfortable.

## Features

- **Customizable Scroll Amounts**: Three different scroll distances (small, medium, and large jumps)
- **Smooth Scrolling**: Enhanced scrolling experience with configurable animation speed and smoothness
- **Keyboard-centric Navigation**: Optimize your workflow with keyboard-driven scrolling

## Keybindings

The extension provides the following default keybindings:

- `ctrl+right`: Scroll small jump down
- `ctrl+left`: Scroll small jump up
- `ctrl+down`: Scroll medium jump down
- `ctrl+up`: Scroll medium jump up
- `alt+pageDown`: Scroll large jump down
- `alt+pageUp`: Scroll large jump up

## Extension Settings

This extension contributes the following settings:

* `scrollerPower.linesToScrollSmall`: Number of lines to scroll for small jump (default: 5)
* `scrollerPower.linesToScrollMedium`: Number of lines to scroll for medium jump (default: 25)
* `scrollerPower.linesToScrollLarge`: Number of lines to scroll for large jump (default: 50)
* `scrollerPower.totalDelay`: Total animation duration in milliseconds (default: 30, min: 10, max: 100)
* `scrollerPower.linesPerTick`: Lines to skip per animation tick (default: 3, min: 1, max: 5)
  - Lower numbers make scrolling smoother but slower
  - Higher numbers make scrolling faster but less smooth

## Requirements

- Visual Studio Code 1.99.0 or higher

## Known Issues

- None at the moment

## Release Notes

### 0.0.1

Initial release of Scroller Power with the following features:
- Three different scroll distances (small, medium, and large jumps)
- Smooth scrolling with configurable animation speed and smoothness
- Keyboard-centric navigation with intuitive keybindings

## Contributing

Feel free to open issues or submit pull requests on our [GitHub repository](https://github.com/yourusername/scroller-power).

## License

This extension is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Enjoy enhanced scrolling in VS Code!**
