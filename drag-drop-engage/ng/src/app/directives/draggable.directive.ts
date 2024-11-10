import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[ngDraggable]',
  standalone: true
})
export class DraggableDirective {

  private _offset: { x: number, y: number } = { x: 0, y: 0 };

  /**
   * Constructor
   * Initializes styles, attributes, and event listeners for the element
   * @param element Injected reference to the element this directive is attached to
   */
  constructor(private element: ElementRef) {
    this.element.nativeElement.addEventListener('dragstart', this.dragStart.bind(this)); // Add event listener for dragstart
    this.element.nativeElement.setAttribute('draggable', 'true'); // Make the element draggable
    this.element.nativeElement.style.position = 'absolute'; // Set the position to absolute

    document.addEventListener('dragover', this.dragOver.bind(this)); // Add event listener for dragover
    document.addEventListener('drop', this.drop.bind(this)); // Add event listener for drop
  }

  /**
   * DragStart event handler
   * Calculates the offset of the mouse pointer from the top-left corner of the element for correct dropping
   * @param event DragEvent
   */
  private dragStart(event: DragEvent): void {
    let elementPos = this.element.nativeElement.getBoundingClientRect(); // Get the position of the element
    this._offset = { x: elementPos.left - event.clientX, y: elementPos.top - event.clientY }; // Calculate the offset
  }

  /**
   * DragOver event handler
   * Prevents the default behaviour of the event to allow dropping the element anywhere
   * @param event DragEvent
   */
  private dragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * Drop event handler
   * Drops the element, updating its position to the mouse pointer's position
   * @param event DragEvent
   */
  private drop(event: DragEvent): void {
    event.preventDefault();

    let x = event.clientX + this._offset.x; // Add the offset to the x position to get the correct position
    let y = event.clientY + this._offset.y; // Add the offset to the y position to get the correct position

    this.element.nativeElement.style.left = x + 'px'; // Set the new x position
    this.element.nativeElement.style.top = y + 'px'; // Set the new y position
  }

}