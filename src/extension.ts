import * as vscode from "vscode";

type Direction = "up" | "down";

const linesPerTick = 1;

/** Only the last N lines of a scroll use smooth one-line ticks; the rest jumps in one step. */
const smoothTailLines = 8;

const delaySmall = 1;
const delayMedium = 1;
const delayLarge = 1;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Vim / VS Code often place the active end on the last space instead of EOL on blank-ish lines. */
function lineMatchesVisualLineActive(
  anchor: vscode.Position,
  lineText: string,
  activeCharacter: number,
): boolean {
  if (anchor.character !== 0) {
    return false;
  }
  const len = lineText.length;
  if (len === 0) {
    return activeCharacter === 0;
  }
  if (activeCharacter === len) {
    return true;
  }
  if (lineText.trim() === "" && len > 1 && activeCharacter === len - 1) {
    return true;
  }
  return false;
}

function vimEmulationActive(): boolean {
  return (
    vscode.extensions.getExtension("vscodevim.vim")?.isActive === true ||
    vscode.extensions.getExtension("asvetliakov.vscode-neovim")?.isActive ===
      true
  );
}

/** VSCodeVim may use a collapsed BOL selection on empty/whitespace-only lines until the first move. */
function vimVisualLineCollapsedOnBlankLine(editor: vscode.TextEditor): boolean {
  if (!vimEmulationActive()) {
    return false;
  }
  const sel = editor.selection;
  if (!sel.isEmpty) {
    return false;
  }
  if (sel.anchor.line !== sel.active.line) {
    return false;
  }
  if (sel.anchor.character !== 0 || sel.active.character !== 0) {
    return false;
  }
  const lineText = editor.document.lineAt(sel.anchor.line).text;
  return lineText.length === 0 || lineText.trim() === "";
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("scrollerPower");

  const linesToScrollSmall: number = config.get("linesToScrollSmall") || 5;
  const linesToScrollMedium: number = config.get("linesToScrollMedium") || 25;
  const linesToScrollLarge: number = config.get("linesToScrollLarge") || 50;
  // const disableSmooth: boolean = config.get("disableSmooth") || false;

  const smoothScroll = async (
    direction: Direction,
    lines: number,
    delayPerTick: number,
  ) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const hasSelection = editor.selections.some(
      (selection) => !selection.isEmpty,
    );

    const bulkLines = Math.max(0, lines - smoothTailLines);
    const smoothLines = lines - bulkLines;

    let selectionDocument: vscode.TextDocument | undefined;
    let selectionAnchor: vscode.Position | undefined;
    let isVisualLineMode = false;
    let useSelectionPath = false;

    if (hasSelection) {
      selectionDocument = editor.document;
      selectionAnchor = editor.selection.anchor;
      const activeLineText = selectionDocument.lineAt(
        editor.selection.active.line,
      ).text;
      isVisualLineMode = lineMatchesVisualLineActive(
        selectionAnchor,
        activeLineText,
        editor.selection.active.character,
      );
      useSelectionPath = true;
    } else if (vimVisualLineCollapsedOnBlankLine(editor)) {
      selectionDocument = editor.document;
      selectionAnchor = editor.selection.anchor;
      isVisualLineMode = true;
      useSelectionPath = true;
    }

    const scrollLineChunk = async (lineCount: number, applyDelay: boolean) => {
      if (lineCount <= 0) {
        return;
      }

      const moveSelectionByLines = (n: number) => {
        if (n <= 0 || !selectionDocument || !selectionAnchor) {
          return;
        }
        const document = selectionDocument;
        const anchor = selectionAnchor;
        const active = editor.selection.active;
        const newActiveLine =
          direction === "down" ? active.line + n : active.line - n;
        const clampedLine = Math.max(
          0,
          Math.min(newActiveLine, document.lineCount - 1),
        );
        let newActive: vscode.Position;
        if (isVisualLineMode) {
          const lineLength = document.lineAt(clampedLine).text.length;
          // Match Vim-style line-wise selection: the moving end at the top of the
          // block is at column 0; at the bottom it is at EOL. Using EOL for both
          // breaks upward extension (top line often shows only the last column).
          newActive =
            direction === "up"
              ? new vscode.Position(clampedLine, 0)
              : new vscode.Position(clampedLine, lineLength);
        } else {
          newActive = new vscode.Position(clampedLine, active.character);
        }
        editor.selection = new vscode.Selection(anchor, newActive);
        // Reveal the active end only. Revealing the full selection often keeps the
        // anchor in view and leaves the head off-screen when extending downward.
        editor.revealRange(
          new vscode.Range(newActive, newActive),
          vscode.TextEditorRevealType.Default,
        );
      };

      if (useSelectionPath && selectionDocument && selectionAnchor) {
        moveSelectionByLines(lineCount);
      } else {
        await vscode.commands.executeCommand("cursorMove", {
          to: direction,
          by: "line",
          value: lineCount,
        });
      }

      if (applyDelay) {
        await delay(delayPerTick);
      }
    };

    if (bulkLines > 0) {
      await scrollLineChunk(bulkLines, false);
    }
    for (let scrolled = 0; scrolled < smoothLines; scrolled += linesPerTick) {
      await scrollLineChunk(linesPerTick, true);
    }
  };

  // const notSmoothScroll = async (direction: Direction, lines: number) => {
  //   const editor = vscode.window.activeTextEditor;
  //   if (!editor) return;

  //   const hasSelection = editor.selections.some(
  //     (selection) => !selection.isEmpty
  //   );

  //   if (hasSelection) {
  //     const document = editor.document;
  //     const anchor = editor.selection.anchor;
  //     const active = editor.selection.active;

  //     const activeLineText = document.lineAt(active.line).text;
  //     const isVisualLineMode =
  //       anchor.character === 0 && active.character === activeLineText.length;

  //     const newActiveLine =
  //       direction === "down" ? active.line + lines : active.line - lines;

  //     const clampedLine = Math.max(
  //       0,
  //       Math.min(newActiveLine, document.lineCount - 1)
  //     );

  //     let newActive;
  //     if (isVisualLineMode) {
  //       const lineLength = document.lineAt(clampedLine).text.length;
  //       newActive = new vscode.Position(clampedLine, lineLength);
  //     } else {
  //       newActive = new vscode.Position(clampedLine, active.character);
  //     }

  //     editor.selection = new vscode.Selection(anchor, newActive);
  //   } else {
  //     await vscode.commands.executeCommand("cursorMove", {
  //       to: direction,
  //       by: "line",
  //       value: lines,
  //     });
  //   }

  // };

  const smallDown = vscode.commands.registerCommand(
    "scrollerPower.smallDown",
    () => {
      // disableSmooth
      //   ? notSmoothScroll("down", linesToScrollSmall)
      smoothScroll("down", linesToScrollSmall, delaySmall);
    },
  );

  const smallUp = vscode.commands.registerCommand(
    "scrollerPower.smallUp",
    () => {
      // disableSmooth
      //   ? notSmoothScroll("up", linesToScrollSmall)
      smoothScroll("up", linesToScrollSmall, delaySmall);
    },
  );

  const mediumDown = vscode.commands.registerCommand(
    "scrollerPower.mediumDown",
    () => {
      // disableSmooth
      //   ? notSmoothScroll("down", linesToScrollMedium)
      smoothScroll("down", linesToScrollMedium, delayMedium);
    },
  );

  const mediumUp = vscode.commands.registerCommand(
    "scrollerPower.mediumUp",
    () => {
      // disableSmooth
      //   ? notSmoothScroll("up", linesToScrollMedium)
      smoothScroll("up", linesToScrollMedium, delayMedium);
    },
  );

  const largeDown = vscode.commands.registerCommand(
    "scrollerPower.largeDown",
    () => {
      // disableSmooth
      //   ? notSmoothScroll("down", linesToScrollLarge)
      smoothScroll("down", linesToScrollLarge, delayLarge);
    },
  );

  const largeUp = vscode.commands.registerCommand(
    "scrollerPower.largeUp",
    () => {
      // disableSmooth
      //   ? notSmoothScroll("up", linesToScrollLarge)
      smoothScroll("up", linesToScrollLarge, delayLarge);
    },
  );

  context.subscriptions.push(smallDown);
  context.subscriptions.push(smallUp);
  context.subscriptions.push(mediumDown);
  context.subscriptions.push(mediumUp);
  context.subscriptions.push(largeDown);
  context.subscriptions.push(largeUp);
}

export function deactivate() {}
