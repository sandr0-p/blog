import { Component, signal, Signal, ViewChild, viewChild, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DraggableDirective } from './directives/draggable.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DraggableDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'drag-and-drop';
}
