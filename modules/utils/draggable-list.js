/**
 * DraggableList by Moerill
 * 
 * LICENSED under LGPLv3
 * https://www.gnu.org/licenses/lgpl-3.0.en.html
 */


export class DraggableList {
	constructor(container, selector, options = {}) {
		if (options.rowHeight === undefined || isNaN(options.rowHeight))
			throw 'options.rowHeight must be defined as a number!';
		this.container = container;
		this.selector = selector;
		this.items = this._getItems(); 

		// container.style.height = options.rowHeight * this.items.length + 'px';

		this.options = mergeObject(this.defaultOptions, options);

		this._listeners = {
			windowMouseMove: ev => this._onWindowMouseMove(ev)
		};

		this.draggedIdx = -1;

		this._initItems();
	}
	
	get defaultOptions() {
		return {
			rowHeight: 21, // in px
			boundary: 10,	// in px
			minHeight: 0,
			onDragStart: null,
			onDragEnd: null,
			onDrop: null,
			deleteOutside: false	// TODO: Do not reinsert element when leaving container
		}
	}

	_getItems() {
		// return Array.from(this.container.querySelectorAll(this.selector));
		return $(this.container).children(this.selector).toArray()
	}

	_initItems() {
		for (let i = 0; i < this.items.length; i++)
			this._initItem(this.items[i], i);

		this.container.addEventListener('dragenter', ev => {
			ev.preventDefault();
			ev.stopPropagation();
			if (this._inside === true)
				return false;

			this._inside = true;
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i] && this.items[i].dataset.grabbed === "true") {
					this._hideEl(this.items[i]);
					this.draggedIdx = i;
					break;
				}
			}

			window.addEventListener('dragover', this._listeners.windowMouseMove, false);
			return false;
		});

		
		this.container.addEventListener('drop', ev => {
			if (typeof(this.options.onDrop) === 'function')
				this.options.onDrop(ev, this.draggedIdx, this.items[this.draggedIdx+1], this.container)

			this.items = this.items.filter(e => e !== undefined && e !== null);
			this.layout();
			this.draggedIdx = -1;
		}, false);
		this.layout(0);
	}

	_initItem(item, idx) {
		item.setAttribute('draggable', true);

		// These two are actually needed so the drop event fires securely
		item.addEventListener('dragover', this._stopEvent, false);
		item.addEventListener('dragleave', this._stopEvent, false);
		
		item.addEventListener('dragstart', ev => this._onDragStart(ev, idx), false);
		item.addEventListener('dragend', ev => this._onDragEnd(ev), false);
		item.addEventListener('dragenter', ev => this._onDragEnter(ev), false);

		item.style.position = "relative";
		// TweenLite.set(item, {top: idx * this.options.rowHeight + 'px'})
	}

	_stopEvent(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		return false;
	}

	/**
	 * Calls the provided onDragStart function, hides the element
	 * and activates the window listener
	 * @param {*} ev 
	 */
	_onDragStart(ev, idx) {
		if (typeof(this.options.onDragStart) === "function")
			this.options.onDragStart(ev, idx);
		this.draggedIdx = idx;
		ev.currentTarget.dataset.grabbed = true;

		
		this._hideEl(ev.currentTarget);
		window.addEventListener('dragover', this._listeners.windowMouseMove);
	}

	_onDragEnd(ev) {
		if (typeof(this.options.onDragEnd) === "function")
			this.options.onDragEnd(ev, this);
		
		// Reset the currently dragged index
		this.draggedIdx = -1;

		ev.currentTarget.dataset.grabbed = false;
		this._showEl(ev.currentTarget);
		window.removeEventListener('dragover', this._listeners.windowMouseMove);
		
		// this.items = this.items.filter(e => e !== undefined && e !== null);
		// this.layout();
		this._resetLayout();
	}

	_onDragEnter(ev) {
		// console.time('Enter')
		ev.preventDefault();
		ev.stopPropagation();
		
		// Calculate current index
		const idx = this._calcIdx(ev.y); 
		//console.log(idx);

		this.items = this.items.filter(e => e !== undefined)
		// reorder the array
		if (this.draggedIdx  === -1) {
			this.items.splice(idx, 0, null);
		} else
			this.items.splice(idx, 0, this.items.splice(this.draggedIdx, 1)[0]);
		
		this.draggedIdx = idx;
		this.layout();
		// console.timeEnd('Enter')
		return false;
	}

	/**
	 * Checks if mouse is inside of the container. If the mouse left the container, reset Arrays position.
	 * @param {*} ev 
	 */
	_onWindowMouseMove(ev) {
		const rect = this.container.getBoundingClientRect(),
					boundary = this.options.boundary;
		if (ev.x > rect.left - boundary
				&& ev.x < rect.right + boundary
				&& ev.y > rect.top - boundary
				&& ev.y < rect.bottom + boundary)
				return;
		
		this.draggedIdx = -1;
		this._resetLayout();
		this._inside = false;
		window.removeEventListener('dragover', this._listeners.windowMouseMove);
	}

	_hideEl(el) {
		TweenLite.to(el, 0.2, {
			opacity: 0,
			height: 0,
			onComplete:  () => this.layout()
		});
	}

	_showEl(el) {
		TweenLite.set(el, {
			clearProps: "opacity,height"
		})
		TweenLite.from(el, 0.2, {
			opacity: 0,
			height: 0
		});
	}

	_calcIdx(y) {
		const containerRect = this.container.getBoundingClientRect();
		let height =  this.options.minHeight + containerRect.top;
		for (var i = 0; i < this.items.length; i++) {
			if (this.items[i] === undefined)
				continue;

			if (this.items[i] === null) {
				height +=  this.options.rowHeight;
				continue;
			}

			height += this.items[i].getBoundingClientRect().height || this.options.rowHeight;
			if (y < height) {
				return i;
			}
		}

		// If for some reasons above method fails,  use old static height method
		return Math.round((y - this.options.minHeight - containerRect.top) / this.options.rowHeight);
	}

	_resetLayout(time=0.2) {
		let containerHeight = this.container.innerHeight;
		this.items = this._getItems();
		for (var i = 0; i < this.items.length; i++) {
			if (this.items[i].dataset.grabbed === "true") {
				this._showEl(this.items[i]);
				this.draggedIdx = i;
			} else {
				TweenLite.to(this.items[i], time, {top: 0})
			}
		}
		TweenLite.to(this.container, time, {clearProps: 'height'})
	}

	/**
	 * Moves every element to its corresponding place as well as resizes the container if needed.
	 */
	layout(time=0.2) {
		const rowHeight = this.options.rowHeight;
		let foundDragged = false;
		let height = 0;
		for (var i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			if (item === undefined)
				continue;
			if (item === null) {
				// height +=  rowHeight;
				foundDragged = true;
				continue;
			}
			height += item.offsetHeight;
			if (item.dataset.grabbed === "true") {
				foundDragged = true;
				this._hideEl(item);
			} else if (foundDragged === true) {
				TweenLite.to(item, time, {top: rowHeight});	
			} else
				TweenLite.to(item, time, {top: 0});	
		}
		if (foundDragged === true)
			height += rowHeight;
		if (height > 0)
			TweenLite.to(this.container, time, {height: height});
	}
}