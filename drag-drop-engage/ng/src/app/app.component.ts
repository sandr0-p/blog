import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DraggableDirective } from './directives/draggable.directive';
import { GridDirective } from './directives/grid.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DraggableDirective, GridDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'drag-and-drop';
}