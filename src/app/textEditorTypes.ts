export enum AllowedStates {
  null,
  bold,
  italic,
  underline,
  bulletedList,
  image,
}

export type AllowedValues = keyof typeof AllowedStates;

export interface IState {
  values: AllowedValues[];
}

export const defaultState: IState = {
  values: ['null'],
};

export interface IBreakContainerReplaceState {
  replace: boolean;
}

export const breakContainerReplaceState: IBreakContainerReplaceState = {
  replace: false,
};
