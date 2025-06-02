import * as vscode from "vscode";

type Direction = "up" | "down";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("scrollerPower");

  const linesToScrollQuarter: number = config.get("linesToScrollQuarter") || 5;
  const linesToScrollHalfPage: number = config.get("linesToScrollHalf") || 25;
  const linesToScrollFullPage: number = config.get("linesToScrollFull") || 50;

  const totalDelay: number = config.get("totalDelay") || 30;
  const linesPerTick: number = config.get("linesPerTick") || 1;
  const minimumDelay: number = 1;

  const smoothScroll = async (direction: Direction, lines: number) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const delayPerTick = Math.max(
      minimumDelay,
      totalDelay / (lines / linesPerTick)
    );

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

    const cursorPosition = editor.selection.active;
    const range = new vscode.Range(cursorPosition, cursorPosition);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  };

  const quarterDown = vscode.commands.registerCommand(
    "scrollerPower.quarterDown",
    () => {
      smoothScroll("down", linesToScrollQuarter);
    }
  );

  const quarterUp = vscode.commands.registerCommand(
    "scrollerPower.quarterUp",
    () => {
      smoothScroll("up", linesToScrollQuarter);
    }
  );

  const halfDown = vscode.commands.registerCommand(
    "scrollerPower.halfDown",
    () => {
      smoothScroll("down", linesToScrollHalfPage);
    }
  );

  const halfUp = vscode.commands.registerCommand("scrollerPower.halfUp", () => {
    smoothScroll("up", linesToScrollHalfPage);
  });

  const fullDown = vscode.commands.registerCommand(
    "scrollerPower.fullDown",
    () => {
      smoothScroll("down", linesToScrollFullPage);
    }
  );

  const fullUp = vscode.commands.registerCommand("scrollerPower.fullUp", () => {
    smoothScroll("up", linesToScrollFullPage);
  });

  context.subscriptions.push(quarterDown);
  context.subscriptions.push(quarterUp);
  context.subscriptions.push(halfDown);
  context.subscriptions.push(halfUp);
  context.subscriptions.push(fullDown);
  context.subscriptions.push(fullUp);
}

export function deactivate() {}
