import * as vscode from "vscode";

type Direction = "up" | "down";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("hello from extension");

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("scrollerPower");

  console.log("hello from inside the activate");

  // let vimExt = vscode.extensions.getExtension("vscodevim.vim");
  // if (!vimExt?.isActive) {
  //   console.log("vim is not active");
  //   return;
  // }
  // const importedApi = vimExt?.exports;
  // console.log("importedd api", importedApi);

  // const vimExt = vscode.extensions.getExtension("vscodevim.vim");
  // const importedApi = vimExt?.exports;
  // if (importedApi) {
  //   console.log("imported apis", importedApi);
  // }

  const linesToScrollHalfPage: number =
    config.get("linesToScrollHalfPage") || 25;
  const linesToScrollFullPage: number =
    config.get("linesToScrollFullPage") || 50;

  const totalDelay: number = config.get("totalDelay") || 30;
  const linesPerTick: number = config.get("linesPerTick") || 1;
  const minimumDelay: number = 1;

  const scroll = async (direction: Direction, totalLines: number) => {
    const delayPerTick = Math.max(
      minimumDelay,
      totalDelay / (totalLines / linesPerTick)
    );
    // const isVisualMode = await vscode.commands.executeCommand<boolean>(
    //   "getContext",
    //   "vim.mode.visual"
    // );
    // console.log("isvisual mode", isVisualMode);
    for (let scrolled = 0; scrolled < totalLines; scrolled += linesPerTick) {
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
      // await vscode.commands.executeCommand("revealRange")
      await delay(delayPerTick);
    }
    if (!vscode.window.activeTextEditor) {
      return;
    }
    vscode.window.activeTextEditor.revealRange(
      vscode.window.activeTextEditor.selection,
      vscode.TextEditorRevealType.InCenter
    );
  };

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

  const scrollHalfDown = vscode.commands.registerCommand(
    "scrollerPower.halfPageDown",
    () => {
      scroll("down", linesToScrollHalfPage);
    }
  );

  const scrollHalfUp = vscode.commands.registerCommand(
    "scrollerPower.halfPageUp",
    () => {
      scroll("up", linesToScrollHalfPage);
    }
  );

  const scrollDown = vscode.commands.registerCommand(
    "scrollerPower.pageDown",
    () => {
      scroll("down", linesToScrollFullPage);
    }
  );

  const scrollUp = vscode.commands.registerCommand(
    "scrollerPower.pageUp",
    () => {
      scroll("up", linesToScrollFullPage);
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

  context.subscriptions.push(scrollHalfDown);
  context.subscriptions.push(scrollHalfUp);
  context.subscriptions.push(scrollDown);
  context.subscriptions.push(scrollUp);
  context.subscriptions.push(keyScrollDown);
  context.subscriptions.push(keyScrollUp);
}

export function deactivate() {}
