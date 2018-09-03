import { IRequestContext } from './IRequestContext';

export interface IRenderer {
  render(context: IRequestContext): Promise<string>;
  renderSSRPage(body: string, context: IRequestContext): Promise<string>;
  renderSPAPage(): Promise<string>;
}
