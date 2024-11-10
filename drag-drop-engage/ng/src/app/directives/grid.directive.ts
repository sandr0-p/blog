import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[ngGrid]',
  standalone: true
})
export class GridDirective implements AfterViewInit {

  @Input('cellSize') cellSize: number = 50; // Size of the grid cells in pixels
  @Input('borderColor') borderColor: string = '#c2c2c2'; // CSS color of the grid border
  @Input('borderWidth') borderWidth: number = 1; // Width of the grid border in

  /** Reference to the element this directive is attached to */
  get nativeElement(): HTMLElement { return this._container.nativeElement; }

  /**
   * Constructor
   * @param _container Injected reference to the element this directive is attached to
   */
  constructor(private _container: ElementRef) { }


  /**
   * AfterViewInit lifecycle hook
   * Creates a grid with the specified cell size and appends it to the container
   */
  public ngAfterViewInit(): void {
    this._container.nativeElement.style.position = 'relative'; // Set the container's position to relative

    let grid = this.createGrid(this.cellSize, this.borderColor, this.borderWidth); // Create a grid with
    this._container.nativeElement.appendChild(grid); // Append the grid to the container
  }

  /**
   * Creates an SVG element with a grid pattern
   * @param cellSize Size of the grid cells in pixels
   * @param borderColor CSS color of the grid border
   * @param borderWidth Width of the grid border in pixels
   * @returns SVG element with a grid pattern
   */
  private createGrid(cellSize: number, borderColor: string = '#c2c2c2', borderWidth: number = 1): SVGElement {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); // Create an SVG element
    svg.setAttribute('width', '100%'); // Set the width
    svg.setAttribute('height', '100%'); // Set the height

    let pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern'); // Create a pattern element
    pattern.setAttribute('id', 'grid'); // Set the id to 'grid'
    pattern.setAttribute('width', cellSize.toString()); // Set the width to the size
    pattern.setAttribute('height', cellSize.toString()); // Set the height to the size
    pattern.setAttribute('patternUnits', 'userSpaceOnUse'); // Set the pattern units to 'userSpaceOnUse'

    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); // Create a path element
    path.setAttribute('d', `M 0 ${cellSize} L 0 0 ${cellSize} 0`); // Set the path data
    path.setAttribute('fill', 'none'); // Set the fill to none
    path.setAttribute('stroke', borderColor); // Set the stroke color
    path.setAttribute('stroke-width', borderWidth.toString()); // Set the stroke width
    pattern.appendChild(path); // Append the path to the pattern

    pattern.appendChild(path); // Append the rect to the pattern
    svg.appendChild(pattern); // Append the pattern to the SVG

    let grid = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); // Create a rect element
    grid.setAttribute('width', '100%'); // Set the width to 100%
    grid.setAttribute('height', '100%'); // Set the height to 100%
    grid.setAttribute('fill', 'url(#grid)'); // Set the fill to the grid pattern

    svg.appendChild(grid); // Append the grid to the SVG

    return svg; // Return the SVG element
  }

}