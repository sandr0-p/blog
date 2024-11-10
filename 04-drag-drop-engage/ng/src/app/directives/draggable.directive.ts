import { AfterViewInit, Directive, ElementRef, Input, OnInit } from '@angular/core';
import { GridDirective } from './grid.directive';

@Directive({
  selector: '[ngDraggable]',
  standalone: true
})
export class DraggableDirective implements AfterViewInit {
  /** Offset of the element from the left edge of the drop zone */
  @Input('leftOffset') leftOffset: number = 0;

  /** Offset of the element from the top edge of the drop zone */
  @Input('topOffset') topOffset: number = 0;

  /** Offset of the mouse pointer from the top-left corner of the element */
  private _mouseOffset: { x: number, y: number } = { x: 0, y: 0 };

  /** Last position of the mouse pointer */
  private _lastPosition: { x: number, y: number } = { x: 0, y: 0 };

  /** Size of the grid cell */
  private _cellSize: number = 50;

  /**
   * Constructor
   * Initializes styles, attributes, and event listeners for the element
   * @param _element Injected reference to the element this directive is attached to
   */
  constructor(private _element: ElementRef, private _gridParent: GridDirective) { 
  }

  public ngAfterViewInit(): void {
    this._cellSize = this._gridParent.cellSize; // Get the cell size from the grid parent

    this._element.nativeElement.addEventListener('dragstart', this.dragStart.bind(this)); // Add event listener for dragstart
    this._element.nativeElement.addEventListener('drag', this.drag.bind(this)); // Add event listener for drag
    this._element.nativeElement.setAttribute('draggable', 'true'); // Make the element draggable
    this._element.nativeElement.style.position = 'absolute'; // Set the position to absolute
    this._element.nativeElement.style.left = (this._cellSize * this.leftOffset) + 'px'; // Set the left position of the element
    this._element.nativeElement.style.top = (this._cellSize * this.topOffset) + 'px'; // Set the top position of the element

    document.addEventListener('dragover', this.dragOver.bind(this)); // Add event listener for dragover
    document.addEventListener('drop', this.drop.bind(this)); // Add event listener for drop
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
    if (!gridPos) return; // Return if the drop zone is not found
    this._mouseOffset = { x: elementPos.left - event.clientX - gridPos.left, y: elementPos.top - event.clientY - gridPos.top }; // Calculate the offset of the mouse pointer from the top-left corner of the element
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
   * Gets the parent element of the grid
   * @returns HTMLElement | null The parent element of the grid or null if not found
   */
  private getGridParent(): HTMLElement | null {
    if (!this._gridParent) {
      let target = this._element.nativeElement.parentElement as HTMLElement;
      while (target) {
        if (target.hasAttribute('ngGrid')) {
          return target
        }
        target = target.parentElement as HTMLElement;
      }
    }
    return null;
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

    let x = event.clientX + this._mouseOffset.x; // Prepare x by adding the mouse and subtracting the drop zone offset
    let y = event.clientY + this._mouseOffset.y; // Prepare y by adding the mouse and subtracting the drop zone offset


    x = Math.round(x / this._cellSize) * this._cellSize; // Calculate the new x position
    y = Math.round(y / this._cellSize) * this._cellSize; // Calculate the new y position

    if (x < 0) x = 0; // if element is too far left, set it to the left edge
    if (y < 0) y = 0; // if element is too far up, set it to the top edge
    if (x + element.width > dropZone.width) {
      let delta = x + element.width - dropZone.width; // Calculate how far the element is past the right edge
      x = Math.floor((x - delta) / this._cellSize) * this._cellSize; // recalulate the x position
    }
    if (y + element.height > dropZone.height) {
      let delta = y + element.height - dropZone.height; // Calculate how far the element is past the bottom edge
      y = Math.floor((y - delta) / this._cellSize) * this._cellSize; // recalulate the y position
    }

    return { x, y }; // Return the new
  }
}
