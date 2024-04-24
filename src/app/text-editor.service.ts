import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  AllowedStates,
  AllowedValues,
  breakContainerReplaceState,
  IBreakContainerReplaceState,
  IState,
} from './textEditorTypes';

const defaultState: IState = {
  values: ['null'],
};

@Injectable({
  providedIn: 'root',
})
export class TextEditorService {
  public setBoldText = new BehaviorSubject<IState>(defaultState);
  notifyBoldTextChange = this.setBoldText.asObservable();

  public setNullText = new BehaviorSubject<IState>(defaultState);
  notifyNullTextChange = this.setNullText.asObservable();

  public setNewElement = new BehaviorSubject(true);
  notifyNewElement = this.setNewElement.asObservable();

  public replaceBreakContainerWithNewElement =
    new BehaviorSubject<IBreakContainerReplaceState>(
      breakContainerReplaceState,
    );
  notifyBreakContainer =
    this.replaceBreakContainerWithNewElement.asObservable();
  public setUnderlineText = new BehaviorSubject<IState>(defaultState);
  notifyUnderlineTextChange = this.setUnderlineText.asObservable();

  public setItalicText = new BehaviorSubject<IState>(defaultState);
  notifyItalicTextChange = this.setItalicText.asObservable();

  public setButteledListText = new BehaviorSubject<IState>(defaultState);
  notifyButteledListTextChange = this.setButteledListText.asObservable();

  constructor() {}

  setStateToReplaceBreakContainer(state: boolean) {
    return this.replaceBreakContainerWithNewElement.next({ replace: state });
  }

  setBold() {
    console.log(defaultState);

    if (defaultState.values.includes('bold')) {
      defaultState.values = defaultState.values.filter(
        (value) => value !== 'bold',
      );

      return this.setBoldText.next(defaultState);
    } else {
      defaultState.values.push('bold');
      return this.setBoldText.next(defaultState);
    }
  }

  setNull() {
    defaultState.values = ['null'];
    return this.setNullText.next(defaultState);
  }

  setUnderline() {
    if (defaultState.values.includes('underline')) {
      defaultState.values = defaultState.values.filter(
        (value) => value !== 'underline',
      );
      return this.setUnderlineText.next(defaultState);
    } else {
      defaultState.values.push('underline');
      return this.setUnderlineText.next(defaultState);
    }
  }

  setItalic() {
    if (defaultState.values.includes('italic')) {
      defaultState.values = defaultState.values.filter(
        (value) => value !== 'italic',
      );
      return this.setItalicText.next(defaultState);
    } else {
      defaultState.values.push('italic');
      return this.setItalicText.next(defaultState);
    }
  }

  setBulletedList() {
    if (defaultState.values.includes('bulletedList')) {
      defaultState.values = defaultState.values.filter(
        (value) => value !== 'bulletedList',
      );
      return this.setButteledListText.next(defaultState);
    } else {
      defaultState.values.push('bulletedList');
      return this.setButteledListText.next(defaultState);
    }
  }
}
