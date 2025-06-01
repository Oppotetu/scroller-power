import * as vscode from "vscode";

type Direction = "up" | "down";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("outside activate");

// let hasSelection = false;

// function detectSelection(editor: vscode.TextEditor) {
//   if (!editor) return;
//   const selected = editor.selections.some((selection) => !selection.isEmpty);
//   if (selected) {
//     console.log("has selection!");
//     hasSelection = true;
//   } else {
//     console.log("doesnt have selectoin!");
//     hasSelection = false;
//   }
// }

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("scrollerPower");

  console.log("inside activate");

  const linesToScrollHalfPage: number =
    config.get("linesToScrollHalfPage") || 25;
  const linesToScrollFullPage: number =
    config.get("linesToScrollFullPage") || 50;

  const totalDelay: number = config.get("totalDelay") || 30;
  const linesPerTick: number = config.get("linesPerTick") || 1;
  const minimumDelay: number = 1;

  const smoothScroll = async (direction: Direction, lines: number) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const hasSelection = editor.selections.some(
      (selection) => !selection.isEmpty
    );
    console.log("selection start of function: ", hasSelection);
    if (hasSelection) {
      const selection = editor.selection;
      const newStart = new vscode.Position(
        selection.start.line,
        selection.start.character
      );
      const newEnd = new vscode.Position(
        direction === "down"
          ? selection.end.line + lines
          : selection.end.line - lines,
        selection.end.character
      );
      editor.selection = new vscode.Selection(newStart, newEnd);
    } else {
      const delayPerTick = Math.max(
        minimumDelay,
        totalDelay / (lines / linesPerTick)
      );
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
    // editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
  };

  function handleVisualScroll(editor: vscode.TextEditor, lines: number) {
    console.log("in visual mode");
    // Handle visual mode scrolling
    const selection = editor.selection;
    // Update both selection and cursor
    const newStart = new vscode.Position(
      selection.start.line + lines,
      selection.start.character
    );
    const newEnd = new vscode.Position(
      selection.end.line + lines,
      selection.end.character
    );
    editor.selection = new vscode.Selection(newStart, newEnd);
    editor.revealRange(
      new vscode.Range(newStart, newEnd),
      vscode.TextEditorRevealType.Default
    );
  }

  function scrollKeyScroll(lines: number) {
    if (!vscode.window.activeTextEditor) {
      return;
    }
    let currentPosition = vscode.window.activeTextEditor.selection.active;
    let moveToLine = currentPosition.line + lines;
    let documentLineCount = vscode.window.activeTextEditor.document.lineCount;
    if (moveToLine > documentLineCount - 1) {
      moveToLine = documentLineCount - 1;
    }
    if (moveToLine < 0) {
      moveToLine = 0;
    }
    let moveToCharactor =
      vscode.window.activeTextEditor.document.lineAt(
        moveToLine
      ).firstNonWhitespaceCharacterIndex;
    let newPosition = new vscode.Position(moveToLine, moveToCharactor);
    vscode.window.activeTextEditor.selection = new vscode.Selection(
      newPosition,
      newPosition
    );
    vscode.window.activeTextEditor.revealRange(
      vscode.window.activeTextEditor.selection,
      vscode.TextEditorRevealType.InCenter
    );
  }

  // function handleScrollInVisualMode(scrollAmount: number) {
  //   const editor = vscode.window.activeTextEditor;
  //   if (!editor) {
  //     return;
  //   }
  //   // Get current selection
  //   const selection = editor.selection;
  //   // Calculate new positions based on smoothScroll amount
  //   const newStart = new vscode.Position(
  //     selection.start.line + scrollAmount,
  //     selection.start.character
  //   );
  //   const newEnd = new vscode.Position(
  //     selection.end.line + scrollAmount,
  //     selection.end.character
  //   );
  //   // Update both selection and cursor
  //   editor.selection = new vscode.Selection(newStart, newEnd);
  //   // Ensure the selection is visible
  //   editor.revealRange(
  //     new vscode.Range(newStart, newEnd),
  //     vscode.TextEditorRevealType.Default
  //   );
  // }

  // function visualHalfPageDown1fun() {
  //   const editor = vscode.window.activeTextEditor;
  //   if (!editor) return;
  //   // Double-check visual mode state
  //   const selection = editor.selection;
  //   const inVisualMode = !selection.start.isEqual(selection.end);
  //   if (inVisualMode) {
  //     // Visual mode scrolling implementation
  //     const scrollAmount =
  //       Math.floor(
  //         editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line
  //       ) / 2;
  //     const newStart = new vscode.Position(
  //       selection.start.line + scrollAmount,
  //       selection.start.character
  //     );
  //     const newEnd = new vscode.Position(
  //       selection.end.line + scrollAmount,
  //       selection.end.character
  //     );
  //     editor.selection = new vscode.Selection(newStart, newEnd);
  //     editor.revealRange(
  //       new vscode.Range(newStart, newEnd),
  //       vscode.TextEditorRevealType.Default
  //     );
  //   } else {
  //     console.log("in normal scrolling");
  //     // Normal mode scrolling implementation
  //     // Your existing scroll code here
  //   }
  // }

  const scrollHalfDown = vscode.commands.registerCommand(
    "scrollerPower.halfPageDown",
    () => {
      smoothScroll("down", linesToScrollHalfPage);
    }
  );

  const scrollHalfUp = vscode.commands.registerCommand(
    "scrollerPower.halfPageUp",
    () => {
      smoothScroll("up", linesToScrollHalfPage);
    }
  );

  const scrollDown = vscode.commands.registerCommand(
    "scrollerPower.pageDown",
    () => {
      smoothScroll("down", linesToScrollFullPage);
    }
  );

  const scrollUp = vscode.commands.registerCommand(
    "scrollerPower.pageUp",
    () => {
      smoothScroll("up", linesToScrollFullPage);
    }
  );

  const keyScrollDown = vscode.commands.registerCommand(
    "scrollerPower.keyScrollDown",
    () => {
      scrollKeyScroll(-1 * linesToScrollHalfPage);
    }
  );

  const keyScrollUp = vscode.commands.registerCommand(
    "scrollerPower.keyScrollUp",
    () => {
      scrollKeyScroll(linesToScrollHalfPage);
    }
  );

  // const visualHalfPageDown1 = vscode.commands.registerCommand(
  //   "scrollerPower.visualHalfPageDown1",
  //   () => {
  //     visualHalfPageDown1fun();
  //   }
  // );

  // const visualHalfPageDown2 = vscode.commands.registerCommand(
  //   "scrollerPower.visualHalfPageDown2",
  //   () => {
  //     visualHalfPageDown2fun(linesToScrollHalfPage);
  //   }
  // );

  // const visualHalfPageDown3 = vscode.commands.registerCommand(
  //   "scrollerPower.visualHalfPageDown3",
  //   () => {
  //     handleScrollInVisualMode(linesToScrollHalfPage);
  //   }
  // );

  // vscode.commands.registerCommand('extension.checkSelection', () => {
  //     detectSelection();
  //   });

  // const selectionChangeListener = vscode.window.onDidChangeTextEditorSelection(
  //   (event) => {
  //     detectSelection(event.textEditor);
  //   }
  // );

  // context.subscriptions.push(visualHalfPageDown1);
  // context.subscriptions.push(visualHalfPageDown2);
  // context.subscriptions.push(visualHalfPageDown3);
  context.subscriptions.push(scrollHalfDown);
  context.subscriptions.push(scrollHalfUp);
  context.subscriptions.push(scrollDown);
  context.subscriptions.push(scrollUp);
  context.subscriptions.push(keyScrollDown);
  context.subscriptions.push(keyScrollUp);
  // context.subscriptions.push(selectionChangeListener);
}

export function deactivate() {}
