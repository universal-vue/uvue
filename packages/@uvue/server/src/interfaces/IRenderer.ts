import { IRequestContext } from './IRequestContext';

export interface IRenderer {
  render(context: IRequestContext): Promise<string>;
}
