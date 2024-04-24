import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderEditorComponent } from './header-editor/header-editor.component';
import {TextAreaComponent} from "./text-area/text-area.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderEditorComponent, TextAreaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-text-edditor';
}
