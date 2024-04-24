import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TextEditorService } from '../text-editor.service';
import { IBreakContainerReplaceState, IState } from '../textEditorTypes';

interface ITextState {
  null: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

//it defines proper ID for new null element by checking previous  null elements' IDs

function createRange(
  node: Node,
  chars: { count: number },
  range?: Range,
): Range {
  if (!range) {
    range = document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node as Text).textContent!.length < chars.count) {
        chars.count -= (node as Text).textContent!.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (let lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range);

        if (chars.count === 0) {
          break;
        }
      }
    }
  }

  return range;
}

function isChildOf(node: Node | null, parentId: string): boolean {
  while (node !== null) {
    if (node instanceof Element && node.id === parentId) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
}

function getCurrentCursorPosition(parentId: string): number {
  const selection = window.getSelection();
  let charCount = -1;
  let node: Node | null;

  if (selection?.focusNode) {
    if (isChildOf(selection.focusNode, parentId)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;

      while (node) {
        if (node instanceof Element && node.id === parentId) {
          break;
        }

        if (node.previousSibling) {
          node = node.previousSibling;
          if (node instanceof Text) {
            // @ts-ignore
            charCount += node.textContent.length;
          }
        } else {
          node = node.parentNode;
          if (node === null) {
            break;
          }
        }
      }
    }
  }

  return charCount;
}

function setCurrentCursorPosition(chars: number, element: any): void {
  if (chars >= 0) {
    const selection = window.getSelection();
    const range = createRange(element!.parentNode!, { count: chars });

    if (range) {
      console.log(range);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }
}

function updateRange(className: string) {
  const selection = window.getSelection();
  console.log(selection);
  const range = document.createRange();
  const element1 = document.getElementsByClassName(className)[0];
  console.log(element1);
  console.log(range);
  const range1 = selection?.getRangeAt(0);
  console.log(range1);
  const container = range1.endContainer as HTMLElement;
  console.log(container);
  if (container.className === 'element') {
    console.log('element;');
    selection?.removeAllRanges();
    range1.setStart(container.firstChild, 0);
    range1.setEnd(container.firstChild, 1);
    console.log(range1);
    selection?.addRange(range);
    return;
  }

  selection?.removeAllRanges();
  range.setStart(element1, 0);
  range.setEnd(element1, 1);
  selection.addRange(range);
  console.log(range);
}

function getNode() {
  const selection = window.getSelection();
  console.log(selection);
  // @ts-ignore
  const node = selection.focusNode.parentElement;
  console.log(node);
  return node;
}

@Component({
  selector: 'app-text-area',
  standalone: true,
  imports: [],
  templateUrl:
    '../../../../../../../Downloads/angular-text-edditor/src/app/text-area/text-area.component.html',
  styleUrl:
    '../../../../../../../Downloads/angular-text-edditor/src/app/text-area/text-area.component.css',
})
export class TextAreaComponent implements AfterViewInit, OnInit {
  @ViewChild('fake_textarea') public textEditor: ElementRef | undefined;
  private states: ITextState = {
    null: true,
    bold: false,
    italic: false,
    underline: false,
  };
  public htmlContent = '';
  private posistion: number = 0;

  text: string = '';
  value: string = '';
  //@ts-ignore
  editor;
  private indexBold: number = 0;
  private indexNull: number = 0;
  private indexBreak: number = 0;
  private replaceBreakWithNewText: boolean = false;
  constructor(private textEditorService: TextEditorService) {}

  applyStateToSelectedText(text: string, state: string) {
    console.log('apply state to selected text');
    const formattedText = `<strong class="bold ${this.indexBold}">${text}</strong>`;
    document.execCommand('insertHTML', false, formattedText);
  }
  public handleSelection() {
    console.log('handle selection');
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    console.log('handle Selection', selection, range);
    const selectedText = selection?.toString();
    if (selectedText) {
      console.log(selectedText);
      if (this.states.bold) {
        return this.applyStateToSelectedText(selectedText, 'bold');
      }

      if (this.states.null) {
        return this.applyStateToSelectedText(selectedText, 'null');
      }
    }
  }

  handleClick(event: Event) {
    console.log('click');
    let newElement = false;
    const selection = window.getSelection();
    const range: Range = selection?.getRangeAt(0);
    const element = this.getClassElementFromRange(range!);
    const length = range.endContainer.textContent?.length;
    const endOffSet = range.endOffset;
    console.log(this.states);
    console.log(range);

    if (length === endOffSet) {
      newElement = true;
    }
    console.log(element);
    if (element) {
      if (element.split(' ')[0] === 'bold') {
        if (!this.states.bold && !newElement) {
          console.log('setting null text');
          return this.textEditorService.setBold();
        }

        if (this.states.bold && newElement) {
          return;
        }
      }

      if (element.split(' ')[0] === 'null') {
        console.log(this.states);
        if (!this.states.null && !newElement) {
          return this.textEditorService.setNull();
        }

        if (this.states.null && newElement) {
          return;
        }

        return;
      }

      if (element.split(' ')[0] === 'breakContainer') {
        this.textEditorService.setStateToReplaceBreakContainer(true);
      }
    }
  }

  onKeyChange(event: KeyboardEvent) {
    console.log(event.key);
    if (!this.textEditor) return;

    const editor = this.textEditor.nativeElement;
    // const selection = window.getSelection();
    // if (!selection) return;

    if (event.key === 'Enter') {
      this.handleEnter(editor, event);
      event.preventDefault();
      return;
    }

    if (this.states.bold) {
      this.handleBold(editor, event.key, this.indexBold);
      return;
    }

    if (this.states.null) {
      const editor1 = document.getElementById('fake_textarea');
      this.handleNull(editor1, event.key, this.indexNull);
      return;
    }
  }

  handleBold(editor: HTMLElement, key: string, indexBold: number) {
    const boldClassName = `bold`;
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    const element = this.getClassElementFromRange(range);
    console.log(element);
    const className = element.split(' ');

    if (element || element !== 'element') {
      if (className[0] !== 'bold') {
        const element: HTMLElement = getNode();
        const boldTextElement = this.createAndInsertElement(
          'strong',
          boldClassName,
          indexBold,
        );
        boldTextElement.innerHTML = key;
        console.log(boldTextElement);
        element.insertAdjacentElement('afterend', boldTextElement);
        updateRange(`bold ${indexBold}`);
        // creatingNewElement = false;
      } else {
        return;
      }
    } else {
      const boldTextElement = this.createAndInsertElement(
        'strong',
        boldClassName,
        indexBold,
      );
      boldTextElement.innerHTML = key;
      editor.appendChild(boldTextElement);
      updateRange('fake_textarea');
      return;
    }
  }

  handleNull(editor: HTMLElement, key: string, indexNull: number) {
    console.log('handle null evenet');
    const nullClassName = `null`;
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    const classNameElement = this.getClassElementFromRange(range);
    console.log(classNameElement);
    const className = classNameElement.split(' ');
    console.log(range);

    if (classNameElement) {
      if (className[0] !== 'null') {
        const element: HTMLElement = getNode();
        console.log(element);
        if (
          className[0] === 'breakContainer' ||
          element.className === 'element'
        ) {
          this.textEditorService.setStateToReplaceBreakContainer(true);
          const NullLastId = this.setNewNullId();
          const nullIndex: number | undefined = NullLastId;
          this.indexNull = nullIndex !== undefined ? nullIndex + 1 : 0;

          console.log(NullLastId);
          const newElement = this.createAndInsertElement(
            'span',
            nullClassName,
            this.indexNull,
          );
          console.log('newelement', newElement);
          const breakContainer: HTMLElement = document.getElementsByClassName(
            classNameElement,
          )[0] as HTMLElement;

          if (this.replaceBreakWithNewText) {
            console.log('REPLACEBREAK:', breakContainer);

            if (element.className === 'element') {
              return this.handleReplaceOfBreakWithNewText(
                element,
                newElement,
                key,
              );
            }
            this.handleReplaceOfBreakWithNewText(
              breakContainer,
              newElement,
              key,
            );
            return;
          }

          // this.handleNewElementBeforeBreak(newElement, key, breakContainer);
          // return;
        }
        const nullTextElement = this.createAndInsertElement(
          'span',
          nullClassName,
          this.indexNull,
        );
        nullTextElement.innerHTML = key;
        console.log(nullTextElement);
        console.log(element);
        element.insertAdjacentElement('afterend', nullTextElement);
        updateRange(`null ${indexNull}`);
        return;
      } else {
        console.log('null element already exists');
      }
    } else {
      const paragraph = this.createContainerElement();
      const nullTextElement = this.createAndInsertElement(
        'span',
        nullClassName,
        this.indexNull,
      );
      nullTextElement.innerHTML = key;
      paragraph.appendChild(nullTextElement);
      editor.appendChild(paragraph);
      updateRange(nullTextElement.className);
      return;
    }
  }

  getClassElementFromRange(range: Range): string | null {
    console.log(range);
    if (range.startContainer.childNodes.length > 0) {
      let endNode;
      let startChildNode: NodeListOf<ChildNode> =
        range.startContainer.childNodes;
      if (startChildNode.length > 0) {
        if (range.startContainer.childNodes[0].nodeName === 'BR') {
          endNode = range.startContainer as HTMLElement;
          return endNode.className;
        }
        //ts-ignore
        endNode = range.startContainer.childNodes[0].lastChild;
      }

      if (endNode) {
        console.log(endNode.className);
        return endNode;
      }
    } else {
      if (range.startContainer.parentElement) {
        return range.startContainer.parentElement.attributes[0].nodeValue;
      }
    }
    return null;
  }

  createAndInsertElement(
    tagName: string,
    className: string,
    index: number,
  ): HTMLElement {
    const element = document.createElement(tagName);
    element.classList.add(className);
    element.classList.add(`${index}`);
    return element;
  }

  updateCursorPosition(editor: HTMLElement, cursorAtSamePosistion: number) {
    const currentPosition = getCurrentCursorPosition('fake_textarea');
    setCurrentCursorPosition(currentPosition + cursorAtSamePosistion, editor);
    editor.focus();
  }

  setNewNullId(): number | null {
    let indexNullArray: number[] = [];
    let breakContainersArray: HTMLElement[] = [];
    let index: number;
    const range = document.createRange();
    const selection = window.getSelection();
    const node = this.editor;
    range.selectNode(node);
    let childNodes = range.endContainer.childNodes[0].childNodes;
    if (childNodes.length === 0) {
      return null;
    } else {
      let endnode;
      let nodeLength = childNodes.length;
      let count = 0;

      console.log(childNodes);

      while (nodeLength > count) {
        endnode = childNodes[count];
        console.log(endnode);
        const className = endnode.className;
        if (className === 'element') {
          const parahraphChildLenght = endnode.childNodes.length;
          let childCount = 0;
          const children = endnode.childNodes;

          for (let i = 0; i < parahraphChildLenght; i++) {
            console.log(children[i]);
            const child = children[i] as HTMLElement;
            const classNameSplitted = child.className.split(' ');
            if (classNameSplitted[0] === 'null') {
              index = parseInt(classNameSplitted[1]);
              indexNullArray.push(index);
            }
            childCount++;
          }
        }

        count++;
      }
    }

    if (indexNullArray.length > 0) {
      console.log(indexNullArray);
      return Math.max(...indexNullArray);
    }
    console.log(indexNullArray);

    return null;
  }

  ngOnInit() {
    this.textEditorService.notifyBoldTextChange.subscribe((value: IState) => {
      if (value.values.includes('bold')) {
        this.states.bold = true;
        this.states.null = false;
        this.indexNull += 1;
      } else {
        this.states.bold = false;
      }
    });

    this.textEditorService.notifyNullTextChange.subscribe((value: IState) => {
      if (value.values.includes('null')) {
        this.states.null = true;
        this.states.bold = false;
        this.indexBold += 1;
      } else {
        this.states.null = false;
      }
    });

    this.textEditorService.notifyBreakContainer.subscribe(
      (value: IBreakContainerReplaceState) => {
        this.replaceBreakWithNewText = value.replace;
      },
    );
  }

  ngAfterViewInit() {
    this.editor = this.textEditor.nativeElement;
  }

  private handleEnter(editor: HTMLElement, event: KeyboardEvent) {
    const container = document.createElement('div');
    container.classList.add('breakContainer');
    container.classList.add(`${this.indexBreak}`);
    container.style.height = '18px';
    const element = document.createElement('br');
    container.appendChild(element);
    const selection = window.getSelection();
    const range: Range = selection?.getRangeAt(0);
    const previousElement = this.findFocusNode();
    const paragraphContainer = this.createContainerElement();
    paragraphContainer.appendChild(container);

    if (!previousElement) {
      editor.appendChild(paragraphContainer);
      this.indexBreak += 1;
      return;
    }
    const length = range.endContainer.textContent?.length;
    const endOffSet = range.endOffset;
    console.log(length, endOffSet);

    if (length > endOffSet) {
      range.insertNode(container);
      event.preventDefault();
      this.indexBreak += 1;
      return;
    }

    if (length === endOffSet) {
      const editor = this.textEditor.nativeElement;
      let node = editor;
      let newRange = document.createRange();
      let numberOfBreaks = 0;
      const foundElement = this.findFocusNode();
      console.log('found Element ', foundElement);
      event.preventDefault();

      console.log(foundElement);
      if (foundElement.className === 'fake_textarea') {
        console.log('fake_textarea', foundElement);
        foundElement.appendChild(paragraphContainer);
      } else {
        foundElement.insertAdjacentElement('afterend', paragraphContainer);
      }

      this.indexBreak += 1;
      console.log('found element', foundElement);
      console.log(foundElement);
      newRange.selectNode(container);
      console.log(newRange);
      console.log(node);
      let nodeList = newRange.endContainer.childNodes;
      let length = nodeList.length;

      if (length === 1) {
        node = nodeList[0];
        nodeList = node.childNodes;
        length = nodeList.length;
        console.log(nodeList);
      }
      const selection = window.getSelection();
      selection?.removeAllRanges();
      newRange.setEnd(container, 0);
      newRange.setStart(container, 0);
      console.log(newRange);
      selection?.addRange(newRange);
    }

    return;
  }

  private handleNewElementBeforeBreak(
    newElement: HTMLElement,
    key: string,
    breakContainer: HTMLElement,
  ) {
    //@ts-ignore
    newElement.innerHTML = key;
    breakContainer.insertAdjacentElement('afterend', newElement);
    updateRange(`${newElement.className}`);
    return;
  }

  //Finds the focus node (element before cursor) in the editor
  private findFocusNode(): HTMLElement {
    const sel = window.getSelection();
    const range = sel?.getRangeAt(0);
    console.log(sel);
    const element = range.endContainer.parentNode as HTMLElement;
    const isChildNodes = element.childNodes.length > 0;
    // console.log(element.className, "className 573")
    // console.log(range)
    // console.log(element.childNodes)
    console.log(range);

    if (!(element.className === 'TextArea')) {
      console.log(element);
      return element.parentNode as HTMLElement;
    }

    if (isChildNodes) {
      console.log(range.endContainer.parentNode, 'find Focus Node');
      return range.endContainer.parentNode as HTMLElement;
    }

    console.log('isChildNodes none');
    return this.TextArea;
  }

  private handleReplaceOfBreakWithNewText(
    breakContainer: HTMLElement,
    newElement: HTMLElement,
    key: string,
  ) {
    const container = document.getElementById('fake_textarea') as HTMLElement;
    newElement.innerHTML = key;

    if (breakContainer.className === 'element') {
      const child = breakContainer.firstElementChild;
      breakContainer.replaceChild(newElement, child);
      updateRange(`${newElement.className}`);
      this.textEditorService.setStateToReplaceBreakContainer(false);
    } else {
      console.log(breakContainer);
      console.log(newElement);
      container.replaceChild(newElement, breakContainer);
      updateRange(`${newElement.className}`);
      console.log(container);
      this.textEditorService.setStateToReplaceBreakContainer(false);
    }
  }

  private createContainerElement(): HTMLElement {
    const containerElement = document.createElement('p');
    containerElement.classList.add('element');
    return containerElement;
  }
}
