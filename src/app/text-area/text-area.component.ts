import {AfterViewInit, Component, ElementRef, OnInit, ViewChild,} from '@angular/core';
import {TextEditorService} from '../text-editor.service';
import {IBreakContainerReplaceState, IState} from '../textEditorTypes';

interface ITextState {
  null: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bulletedList: boolean;
}

//it defines proper ID for new null element by checking previous  null elements' IDs



@Component({
  selector: 'app-text-area',
  standalone: true,
  imports: [],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.css',
})
export class TextAreaComponent implements AfterViewInit, OnInit {
  // @ViewChild('fake_textarea') public textEditor: ElementRef | undefined;
  @ViewChild('TextArea') public TextAreaElement: ElementRef;
  private TextArea: ElementRef;
  private states: ITextState = {
    null: true,
    bold: false,
    italic: false,
    underline: false,
    bulletedList: false,
  };

  text: string = '';
  value: string = '';
  //@ts-ignore
  private indexBold: number = 0;
  private indexNull: number = 0;
  private previousState: ITextState;
  constructor(private textEditorService: TextEditorService) {}

  handleSelection() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const endOffSet = range.endOffset;
    const focusedNode = this.findFocusNode();
    const selectedText = selection.toString().trim().length;
    const startNode = range.startContainer.parentNode;
    const endNode = range.endContainer.parentNode;
    const startOffSet = range.startOffset;
    const endOffSeet = range.endOffset;
    const mainContainer = range.commonAncestorContainer as HTMLElement;

    console.log(
      'selection: ',
      selection,
      'range: ',
      range,
      'length: ',
      length,
      'endOffset: ',
      endOffSet,
      'foucusedNode: ',
      focusedNode,
      'selectedText: ',
      selectedText,
    );

    if (mainContainer.id === 'TextArea') {
      let textContainer = '';
      const newHTMLStructure = this.travelThroughNodes(
        startNode,
        range,
        textContainer,
        {},
        0,
      );
      console.log(newHTMLStructure);
    }
  }

  travelThroughNodes(
    node: Node | HTMLElement,
    range: Range,
    textContainer: string,
    structure: object,
    index: number,
  ) {
    if (node === range.startContainer.parentNode) {
      textContainer += node.textContent?.slice(
        range.startOffset,
        node.textContent.length,
      );

      if (node.nextSibling) {
        return this.travelThroughNodes(
          node.nextSibling,
          range,
          textContainer,
          structure,
          index,
        );
      } else {
        return this.travelThroughNodes(
          node.parentElement.nextSibling.firstChild,
          range,
          textContainer,
          structure,
          index + 1,
        );
      }
    }

    if (node === range.endContainer.parentNode) {
      textContainer += node.textContent?.slice(0, range.endOffset);
      if (range.endOffset !== node.textContent.length) {
      }

      return structure;
    }

    if (!node.nextSibling) {
      textContainer += node.textContent;

      return this.travelThroughNodes(
        node.parentElement.nextSibling.firstChild,
        range,
        textContainer,
        structure,
        index + 1,
      );
    }

    textContainer += node.textContent;
    return this.travelThroughNodes(
      node.nextSibling,
      range,
      textContainer,
      structure,
      index,
    );
  }

  private applyStateToSelectedText(
    structure: object,
    index: number,
    state: ITextState,
    textContent: string,
  ) {}



  onKeyChange(event: KeyboardEvent) {
    const focusedNode = this.findFocusNode();
    // const container = focusedNode.parentNode as HTMLElement;
    const container = this.findSpanNode(focusedNode.parentNode as HTMLElement);
    let leafText: HTMLElement;
    let baseNode: HTMLElement | null
    const range = this.createRange();

    if (event.key === 'Enter') {
      this.handleEnter(focusedNode, range);
      event.preventDefault();
      return;
    }

    const isStateSame = this.isPrevStateSame(this.previousState, this.states);

    if (!isStateSame) {
      const nodeContainer = this.nodeText();
      if (this.states.null) {
        leafText = this.handleNull(event.key);
        baseNode = leafText;
      }

      if (this.states.bold) {
        leafText = this.handleBold(leafText);
      }

      if (this.states.italic) {
        leafText = this.handleItalic(leafText);
      }

      if (this.states.underline) {
        leafText = this.hanldeUnderlineText(leafText);
      }

      if (this.states.bulletedList) {
        leafText = this.handleBulletedList(leafText);
      }

      nodeContainer.appendChild(leafText);

      if (container.className === 'elementNull') {
        this.swapElementWithinParagraph(container, nodeContainer);
      } else if (container.className === 'nodeText 0') {
        this.insertNewNode(focusedNode, nodeContainer);
      }

      this.updateRange(baseNode);

    }

    this.previousState = JSON.parse(JSON.stringify(this.states));
  }

  handleBold(leafText) {
    const boldElement = this.createAndInsertElement(
      'strong',
      'bold',
      this.indexBold,
    );
    if (!leafText) {
      leafText = boldElement;
      return leafText;
    } else {
      boldElement.appendChild(leafText);
      leafText = boldElement;
      return leafText;
    }
  }

  handleNull(key: string) {
    const newElement = this.createAndInsertElement(
      'span',
      'null',
      this.indexNull,
    );
    newElement.innerHTML = key;
    return newElement;
  }

  hanldeUnderlineText(leafText: HTMLElement) {
    const newElementUnderline = this.createAndInsertElement(
      'u',
      'underline',
      0,
    );
    if (!leafText) {
      leafText = newElementUnderline;
      return leafText;
    }
    newElementUnderline.appendChild(leafText);
    leafText = newElementUnderline;
    return leafText;
  }

  handleItalic(leafText: HTMLElement) {
    const italicElement = this.createAndInsertElement('em', 'italic', 0);
    if (!leafText) {
      leafText = italicElement;
      return leafText;
    } else {
      italicElement.appendChild(leafText);
      leafText = italicElement;
      return leafText;
    }
  }

  private handleBulletedList(leafText: HTMLElement) {
    const BulletedListElement = this.createAndInsertElement(
      'li',
      'bulletedList',
      0,
    );
    if (!leafText) {
      leafText = BulletedListElement;
      return leafText;
    } else {
      BulletedListElement.appendChild(leafText);
      leafText = BulletedListElement;
      return leafText;
    }
  }

  private handleEnter(focusedNode: HTMLElement, range: Range) {
    const newParagraph = this.createContainerElement('elementNull');
    const breakElement = document.createElement('br');
    const nodeContainer = this.nodeText();
    const container = this.findParagraphNode(focusedNode);
    const length = focusedNode.textContent?.length;
    const endOffSet = range.endOffset;
    let nullElement: HTMLElement;
    if (!container) {
      console.log("paragraph node not found")
      return;
    }


    if (length === endOffSet) {

      nullElement = this.handleNull('&zwnj;');
      nullElement.appendChild(breakElement);
      newParagraph.appendChild(nullElement);
      container.insertAdjacentElement('afterend', newParagraph);




    }

    if (length > endOffSet) {
      range.selectNode(container);
      range.insertNode(newParagraph);
    }

    this.updateRange(nullElement);
  }

  private swapElementWithinParagraph(
    container: HTMLElement,
    newElement: HTMLElement,
  ): void {
    console.log(container.firstElementChild);
    const childToReplace = container.firstElementChild;
    container.replaceChild(newElement, childToReplace);
    container.classList.remove('elementNull');
    container.classList.add('element');
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

  setNewId(className: string, initialIndex: number): number {
    let indexElements: number[] = [];
    let index: number;
    const range = document.createRange();
    const mainNode = this.TextAreaElement.nativeElement as HTMLElement;
    range.selectNode(mainNode);
    const childNodes = range.endContainer.childNodes[0].childNodes;
    if (childNodes.length === 0) {
      return this.indexNull;
    } else {
      let endnode;
      let nodeLength = childNodes.length;
      let count = 0;


      while (nodeLength > count) {
        endnode = childNodes[count];
        console.log(endnode);
        const className = endnode.className;
        if (className === 'element' || className === 'elementNull') {
          const parahraphChildLenght = endnode.childNodes.length;
          let childCount = 0;
          const children = endnode.childNodes;

          for (let i = 0; i < parahraphChildLenght; i++) {
            console.log(children[i]);
            const child = children[i] as HTMLElement;
            const classNameSplitted = child.className.split(' ');
            if (classNameSplitted[0] === className) {
              index = parseInt(classNameSplitted[1]);
              indexElements.push(index);
            }
            childCount++;
          }
        }

        count++;
      }
    }

    if (indexElements.length > 0) {
      console.log(indexElements);
      return Math.max(...indexElements) + 1;
    }
    console.log(indexElements);

    return initialIndex;
  }

  private isPrevStateSame(prevState, currentState): boolean {
    if (!prevState) {
      return false;
    }

    for (const key in prevState) {
      if (prevState[key] !== currentState[key]) {
        return false;
      }
    }
    return true;
  }





  //Finds the focus node (element before cursor) in the editor
  private findFocusNode(): HTMLElement {
    const sel = window.getSelection();
    const range = sel?.getRangeAt(0);
    let element = range.endContainer.parentNode as HTMLElement;

    if (
      element.className === 'element' ||
      element.className === 'elementNull'
    ) {
      element = range.endContainer as HTMLElement;
    }

    if (element.className !== 'TextArea') {
      return element as HTMLElement;
    }

    console.log('isChildNodes none');
    return this.TextAreaElement.nativeElement as HTMLElement;
  }

  private handleReplaceOfBreakWithNewText(
    paragraphContainer,
    newElement: HTMLElement,
  ) {
    if (
      paragraphContainer.className === 'element' ||
      paragraphContainer.className === 'elementNull'
    ) {
      const childToReplace = paragraphContainer.firstElementChild;
      paragraphContainer.replaceChild(newElement, childToReplace);
    }
  }

  private createContainerElement(className:string): HTMLElement {
    const containerElement = document.createElement('p');
    containerElement.classList.add(className);
    return containerElement;
  }

  private nodeText(): HTMLElement {
    return this.createAndInsertElement('span', 'nodeText', 0);
  }

  private insertNewNode(focusedNode: HTMLElement, nodeContainer: HTMLElement) {
    const range = window.getSelection().getRangeAt(0);
    const endOffSet = range.endOffset;
    const startOffSet = range.startOffset;
    const lengthText = focusedNode.textContent.length;

    if (lengthText === endOffSet) {
      const spanNode = this.findSpanNode(focusedNode.parentNode as HTMLElement)
      console.log(spanNode);
      spanNode.insertAdjacentElement('afterend', nodeContainer);
      return;
    }





  }
  // Recursively finds the first HTMLElement node with the class name 'nodeText 0'
  //starting from the provided focusedNode that needs to be child of the parent we are looking for.
  private findSpanNode(focusedNode: HTMLElement): HTMLElement {
    const node = focusedNode as HTMLElement
    if (node.className === 'nodeText 0' || node.className === 'element' || node.className === 'elementNull') {
      return node
    }
    else {
      return this.findSpanNode(node.parentNode as HTMLElement);
    }

  }

  private findParagraphNode(focusedNode: HTMLElement): HTMLElement | null {

    if (!focusedNode) {
      return null;
    }

    if (focusedNode.className === 'element' || focusedNode.className === 'elementNull') {
      return focusedNode;
    } else {
      return this.findParagraphNode(focusedNode.parentNode as HTMLElement);
    }
  }


  private createRange(): Range {
    return window.getSelection().getRangeAt(0);
  }

  private updateRange(element: HTMLElement): void {
    const selection = window.getSelection();
    console.log(selection);
    const range = document.createRange();
    const container = this.findParagraphNode(element);
    selection.removeAllRanges();

    if (container.className === 'elementNull') {

      range.setStart(element.firstChild, 0);
      range.setEnd(element.firstChild, 0);
    }

    range.setStart(element, 0);
    range.setEnd(element, 1);
    selection.addRange(range);
  }




  ngOnInit() {
    this.textEditorService.notifyBoldTextChange.subscribe((value: IState) => {
      if (value.values.includes('bold')) {
        this.states.bold = true;
        this.indexNull += 1;
      } else {
        this.states.bold = false;
      }
    });

    this.textEditorService.notifyUnderlineTextChange.subscribe(
      (value: IState) => {
        this.states.underline = value.values.includes('underline');
      },
    );

    this.textEditorService.notifyBreakContainer.subscribe(
      (value: IBreakContainerReplaceState) => {
        this.replaceBreakWithNewText = value.replace;
      },
    );

    this.textEditorService.notifyItalicTextChange.subscribe((value: IState) => {
      this.states.italic = value.values.includes('italic');
    });
  }

  ngAfterViewInit() {
    this.TextArea = this.TextAreaElement.nativeElement;
  }
}
