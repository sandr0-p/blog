import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { GridDirective } from './grid.directive';

@Directive({
  selector: '[ngDraggable]',
  standalone: true
})
export class DraggableDirective implements AfterViewInit {

  /** Width in number of cells */
  @Input('width') width: number = 3;

  /** Height in number of cells */
  @Input('height') height: number = 3;

  private _offset: { x: number, y: number } = { x: 0, y: 0 };
  private _lastPosition: { x: number, y: number } = { x: 0, y: 0 };
  private _cellSize: number = 50;

  /**
   * Constructor
   * Initializes styles, attributes, and event listeners for the element
   * @param _element Injected reference to the element this directive is attached to
   */
  constructor(private _element: ElementRef, private _gridParent: GridDirective) {
    this._element.nativeElement.addEventListener('dragstart', this.dragStart.bind(this)); // Add event listener for dragstart
    this._element.nativeElement.setAttribute('draggable', 'true'); // Make the element draggable
    this._element.nativeElement.style.position = 'absolute'; // Set the position to absolute
    this._element.nativeElement.addEventListener('drag', this.drag.bind(this)); // Add event listener for drag

    document.addEventListener('dragover', this.dragOver.bind(this)); // Add event listener for dragover
    document.addEventListener('drop', this.drop.bind(this)); // Add event listener for drop
  }

  public ngAfterViewInit(): void {
    this._cellSize = this._gridParent.cellSize;

    this._element.nativeElement.style.width = `${this.width * this._cellSize}px`;
    this._element.nativeElement.style.height = `${this.height * this._cellSize}px`;
  }

  /**
   * DragStart event handler
   * Calculates the offset of the mouse pointer from the top-left corner of the element for correct dropping
   * @param event DragEvent
   */
  private dragStart(event: DragEvent): void {
    this.removeGhost(event); // Remove the ghost image of the dragged element
    let elementPos = this._element.nativeElement.getBoundingClientRect(); // Get the position of the element
    let gridPos = this._gridParent.nativeElement.getBoundingClientRect(); // Get the position of the drop zone
    this._offset = { x: elementPos.left - event.clientX - gridPos.x, y: elementPos.top - event.clientY - gridPos.y }; // Calculate the offset of the mouse pointer
  }

  /**
   * DragOver event handler
   * Prevents the default behaviour of the event to allow dropping the element anywhere
   * @param event DragEvent
   */
  private dragOver(event: DragEvent): void {
    if (this.getDropZone(event)) {
      event.preventDefault();
    }
  }

  /**
   * Drag event handler
   * Updates the position of the element to the mouse pointer's position
   * @param event DragEvent
   */
  private drag(event: DragEvent): void {
    let currentPosition = { x: event.clientX, y: event.clientY }; // Get the current position of the mouse pointer
    if (currentPosition.x === this._lastPosition.x && currentPosition.y === this._lastPosition.y) return;// check if the position has changed
    this._lastPosition = currentPosition; // Update the last position to the current position

    var position = this.calculatePosition(event, this._element.nativeElement?.getBoundingClientRect()); // Calculate the new position
    this._element.nativeElement.style.left = position.x + 'px'; // Set the new x position
    this._element.nativeElement.style.top = position.y + 'px'; // Set the new y position
  }

  /**
   * Drop event handler
   * Drops the element, updating its position to the mouse pointer's position
   * @param event DragEvent
   */
  private drop(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * Gets the drop zone of the dragged element
   * @param event DragEvent
   * @returns HTMLElement | null The drop zone element or null if not found
   */
  private getDropZone(event: DragEvent): HTMLElement | null {
    let target = event.target as HTMLElement; // Get the target of the event
    while (target) { // Loop through the target and its parents
      if (target.hasAttribute('ngGrid')) { // Check if the target has the 'ngGrid' attribute
        return target; // Return true if it does
      }
      target = target.parentElement as HTMLElement; // Move to the parent of the target
    }
    return null; // Return false if the 'ngGrid' attribute is not found
  }

  /**
   * Removes the ghost image of the dragged element
   * @param event DragEvent
   */
  private removeGhost(event: DragEvent): void {
    let image = new Image(); // Create a new image
    image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='; // Set the source of the image
    event.dataTransfer?.setDragImage(image, 0, 0); // Set the drag image to the new image
  }

  /**
   * Calculates the position of the top left corner for the dragged element within the drop zone
   * and ensures the element does not go outside the drop zone
   * @param element DOMRect of the dragged element
   * @param zone DOMRect of the drop zone
   * @returns { x: number, y: number } The new position of the element
   */
  private calculatePosition(event: DragEvent, element: DOMRect): { x: number, y: number } {

    let dropZone = this.getDropZone(event)?.getBoundingClientRect(); // Get the rect of the drop zone
    if (!dropZone) return { x: 0, y: 0 }; // Return 0, 0 if the drop zone is not found

    let x = event.clientX + this._offset.x; // Prepare x by adding the mouse
    let y = event.clientY + this._offset.y; // Prepare y by adding the mouse


    x = Math.round(x / this._cellSize) * this._cellSize; // Calculate the new x position
    y = Math.round(y / this._cellSize) * this._cellSize; // Calculate the new y position

    if (x < 0) x = 0; // if element is too far left, set it to the left edge
    if (y < 0) y = 0; // if element is too far up, set it to the top edge
    if (x + element.width > dropZone.width) { // if element is too far right, set it to the right edge
      let delta = x + element.width - dropZone.width; // Calculate how far the element is past the right edge
      x = Math.floor((x - delta) / this._cellSize) * this._cellSize; // recalulate the x position
    }
    if (y + element.height > dropZone.height) { // if element is too far down, set it to the bottom edge
      let delta = y + element.height - dropZone.height; // Calculate how far the element is past the bottom edge
      y = Math.floor((y - delta) / this._cellSize) * this._cellSize; // recalulate the y position
    }

    return { x, y }; // Return the new
  }
}