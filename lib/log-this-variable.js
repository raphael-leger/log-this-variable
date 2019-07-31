'use babel';

import LogThisVariableView from './log-this-variable-view';
import { CompositeDisposable } from 'atom';

const LANGAGES = {
  UNKNOWN: 'UNKNOWN',
  JAVASCRIPT: 'JAVASCRIPT',
  PYTHON: 'PYTHON'
}

export default {
  logThisVariableView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.logThisVariableView = new LogThisVariableView(state.logThisVariableViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.logThisVariableView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that logs this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'log-this-variable:log': () => this.log()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.logThisVariableView.destroy();
  },

  serialize() {
    return {
      logThisVariableViewState: this.logThisVariableView.serialize()
    };
  },

  log() {
    let editor;

    if (editor = atom.workspace.getActiveTextEditor()) {
      let programmingLangage = LANGAGES.UNKNOWN;

      if (editor.getTitle().endsWith('.js')) {
        programmingLangage = LANGAGES.JAVASCRIPT;
      } else if (editor.getTitle().endsWith('.ts')) {
        programmingLangage = LANGAGES.JAVASCRIPT;
      } else if (editor.getTitle().endsWith('.tsx')) {
        programmingLangage = LANGAGES.JAVASCRIPT;
      } else if (editor.getTitle().endsWith('.py')) {
        programmingLangage = LANGAGES.PYTHON;
      } else if (editor.getTitle().endsWith('.java')) {
        programmingLangage = LANGAGES.JAVA;
      }

      editor.selectWordsContainingCursors();
      let selection = editor.getSelectedText();

      editor.moveToEndOfLine();

      let logStatement;
      if (programmingLangage === LANGAGES.JAVASCRIPT) {
        logStatement = `console.log('${selection}', ${selection});`;
      } else if (programmingLangage === LANGAGES.PYTHON) {
        logStatement = `print('${selection}: {}'.format(${selection}))`;
      } else if (programmingLangage === LANGAGES.JAVA) {
        logStatement = `System.out.println("${selection}" + ${selection})`;
      }

      if (logStatement) {
        editor.insertNewline();
        editor.insertNewline();
        editor.insertText(logStatement);

        editor.moveDown();
        editor.moveToBeginningOfLine();
        editor.selectToEndOfLine();

        const nextLineIsEmpty = !editor.getSelectedText();
        editor.moveUp();
        editor.moveToEndOfLine();

        if (!nextLineIsEmpty) {
          editor.insertNewline();
        }
      }
    }
  }
};
