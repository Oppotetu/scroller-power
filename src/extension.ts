import * as vscode from "vscode";

type Direction = "up" | "down";

const linesPerTick = 1;

const delaySmall = 1;
const delayMedium = 1;
const delayLarge = 1;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("scrollerPower");

  const linesToScrollSmall: number = config.get("linesToScrollSmall") || 5;
  const linesToScrollMedium: number = config.get("linesToScrollMedium") || 25;
  const linesToScrollLarge: number = config.get("linesToScrollLarge") || 50;
  const disableSmooth: boolean = config.get("disableSmooth") || false;
  const disableCentering: boolean = config.get("disableCentering") || false;

  const smoothScroll = async (
    direction: Direction,
    lines: number,
    delayPerTick: number
  ) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const hasSelection = editor.selections.some(
      (selection) => !selection.isEmpty
    );

    if (hasSelection) {
      const document = editor.document;
      const anchor = editor.selection.anchor;

      const activeLineText = document.lineAt(editor.selection.active.line).text;
      const isVisualLineMode =
        anchor.character === 0 &&
        editor.selection.active.character === activeLineText.length;

      for (let scrolled = 0; scrolled < lines; scrolled += linesPerTick) {
        const selection = editor.selection;
        const active = selection.active;

        const newActiveLine =
          direction === "down"
            ? active.line + linesPerTick
            : active.line - linesPerTick;

        const clampedLine = Math.max(
          0,
          Math.min(newActiveLine, document.lineCount - 1)
        );

        let newActive;
        if (isVisualLineMode) {
          // In visual line mode, move active to end of the line
          const lineLength = document.lineAt(clampedLine).text.length;
          newActive = new vscode.Position(clampedLine, lineLength);
        } else {
          // In normal visual mode, preserve character position
          newActive = new vscode.Position(clampedLine, active.character);
        }

        editor.selection = new vscode.Selection(anchor, newActive);
        await vscode.commands.executeCommand("editorScroll", {
          to: direction,
          by: "line",
          value: linesPerTick,
          revealCursor: true,
        });
        await delay(delayPerTick);
      }
    } else {
      for (let scrolled = 0; scrolled < lines; scrolled += linesPerTick) {
        await vscode.commands.executeCommand("editorScroll", {
          to: direction,
          by: "line",
          value: linesPerTick,
          revealCursor: true,
        });
        await vscode.commands.executeCommand("cursorMove", {
          to: direction,
          by: "line",
          value: linesPerTick,
        });
        await delay(delayPerTick);
      }
    }

    if (!disableCentering) {
      const cursorPosition = editor.selection.active;
      const range = new vscode.Range(cursorPosition, cursorPosition);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
  };

  const notSmoothScroll = async (direction: Direction, lines: number) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const hasSelection = editor.selections.some(
      (selection) => !selection.isEmpty
    );

    if (hasSelection) {
      const document = editor.document;
      const anchor = editor.selection.anchor;
      const active = editor.selection.active;

      const activeLineText = document.lineAt(active.line).text;
      const isVisualLineMode =
        anchor.character === 0 && active.character === activeLineText.length;

      const newActiveLine =
        direction === "down" ? active.line + lines : active.line - lines;

      const clampedLine = Math.max(
        0,
        Math.min(newActiveLine, document.lineCount - 1)
      );

      let newActive;
      if (isVisualLineMode) {
        const lineLength = document.lineAt(clampedLine).text.length;
        newActive = new vscode.Position(clampedLine, lineLength);
      } else {
        newActive = new vscode.Position(clampedLine, active.character);
      }

      editor.selection = new vscode.Selection(anchor, newActive);
    } else {
      await vscode.commands.executeCommand("cursorMove", {
        to: direction,
        by: "line",
        value: lines,
      });
    }

    if (!disableCentering) {
      const cursorPosition = editor.selection.active;
      const range = new vscode.Range(cursorPosition, cursorPosition);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
  };

  const smallDown = vscode.commands.registerCommand(
    "scrollerPower.smallDown",
    () => {
      disableSmooth
        ? notSmoothScroll("down", linesToScrollSmall)
        : smoothScroll("down", linesToScrollSmall, delaySmall);
    }
  );

  const smallUp = vscode.commands.registerCommand(
    "scrollerPower.smallUp",
    () => {
      disableSmooth
        ? notSmoothScroll("up", linesToScrollSmall)
        : smoothScroll("up", linesToScrollSmall, delaySmall);
    }
  );

  const mediumDown = vscode.commands.registerCommand(
    "scrollerPower.mediumDown",
    () => {
      disableSmooth
        ? notSmoothScroll("down", linesToScrollMedium)
        : smoothScroll("down", linesToScrollMedium, delayMedium);
    }
  );

  const mediumUp = vscode.commands.registerCommand(
    "scrollerPower.mediumUp",
    () => {
      disableSmooth
        ? notSmoothScroll("up", linesToScrollMedium)
        : smoothScroll("up", linesToScrollMedium, delayMedium);
    }
  );

  const largeDown = vscode.commands.registerCommand(
    "scrollerPower.largeDown",
    () => {
      disableSmooth
        ? notSmoothScroll("down", linesToScrollLarge)
        : smoothScroll("down", linesToScrollLarge, delayLarge);
    }
  );

  const largeUp = vscode.commands.registerCommand(
    "scrollerPower.largeUp",
    () => {
      disableSmooth
        ? notSmoothScroll("up", linesToScrollLarge)
        : smoothScroll("up", linesToScrollLarge, delayLarge);
    }
  );

  context.subscriptions.push(smallDown);
  context.subscriptions.push(smallUp);
  context.subscriptions.push(mediumDown);
  context.subscriptions.push(mediumUp);
  context.subscriptions.push(largeDown);
  context.subscriptions.push(largeUp);
}

export function deactivate() {}
