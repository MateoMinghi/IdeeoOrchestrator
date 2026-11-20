import { createRoot } from 'react-dom/client';
import { IdeeoChat } from './IdeeoChat';
import { payMeToken } from './client';
import { applySkinChoice, readSkinChoice } from '../lib/skins';
import { applyFont, readFont } from '../lib/fonts';
import './styles.css';

applySkinChoice(readSkinChoice());
applyFont(readFont());
createRoot(document.getElementById('root')!).render(<IdeeoChat getToken={payMeToken} />);
