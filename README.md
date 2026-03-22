# Scroller Power

Enhances your scrolling experience with customizable keybindings and smooth scrolling behavior. This extension provides different scroll amounts for different keys, making navigation through your code more efficient and comfortable. Compatible with the vscode vim extension visual mode, so that scrolling will select more text if you are in visual mode.

## Features

- **Customizable Scroll Amounts**: Three different scroll distances (small, medium, and large jumps)
- **Smooth Scrolling**: Makes it easier for your eyes to track where in the code you are. Can be disabled for faster scrolling
- **Keyboard-centric Navigation**: This extension is meant to be used with keyboard bindings. Remap the bindings if needed
- **Vim-like visual mode**: If you have any text selected, you can quickly select more by simply scrolling using the keybinds. Compatible with the vscode vim extension.
- **Centering**: Centers on the cursor by default. Can be disabled

## Keybindings

The extension provides the following default keybindings:

- `ctrl+e`: Scroll down (small amount)
- `ctrl+y`: Scroll up (small amount)
- `ctrl+d`: Scroll down (medium amount)
- `ctrl+j`: Scroll up (medium amount)
- `ctrl+pageDown`: Scroll down (large amount)
- `ctrl+pageUp`: Scroll up (large amount)

Rebind these as needed. I tried to make them as similar to Vim as possible, but since ctrl+u is taken in vsc by default i went with ctrl+j instead.

## Extension Settings

This extension contributes the following settings:

- `scrollerPower.linesToScrollSmall`: Number of lines to scroll for small jump (default: 5, min: 1, max: 20)
- `scrollerPower.linesToScrollMedium`: Number of lines to scroll for medium jump (default: 25, min: 20, max: 40)
- `scrollerPower.linesToScrollLarge`: Number of lines to scroll for large jump (default: 50, min: 40, max: 75)
- `scrollerPower.disableSmooth`: Disable smooth scrolling (default: false)
- `scrollerPower.disableCentering`: Disable centering (default: false)

## Known Issues

- None at the moment

## Release Notes

### 0.0.1

Initial release of Scroller Power with the following features:

- Three different scroll distances (small, medium, and large jumps)
- Smooth scrolling
-

## Contributing

Feel free to open issues or submit pull requests on my [GitHub repository](https://github.com/Oppotetu/scroller-power).

## License

This extension is licensed under the MIT License.
