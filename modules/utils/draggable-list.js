/**
 * From Valentin "Moerill" Henkys
 * the code is licensed under LGPL v3.
 * Original is implemented in his module "Mess":
 * https://github.com/Moerill/Mess
 * LICENSE: https://github.com/Moerill/Mess/blob/master/LICENSE
 */
export class DraggableList {
	constructor(container, selector, options = {}) {
		this.container = container;
		this.selector = selector;
		this.options = mergeObject(this.defaultOptions, options);

		this._init();
	}
	
	get defaultOptions() {
		return {
			offset: 21, // in px
			time: 0.1, // in seconds
			// folowing are not used
			onDragStart: null,
			onDragEnd: null,
			onDrop: null,
			
		}
	}

	async _init() {
		this._items = Array.from(this.container.childNodes).filter(e => e.matches && e.matches(this.selector));
		this.container.addEventListener('dragleave', ev => {
			const rect = this.container.getBoundingClientRect();
			const boundary = 5;
			//  Reset offsets, when first target was inside a child container.
			const insideChild = ev.insideChild;
			if (!insideChild 
					&& ev.clientY < rect.y + rect.height - boundary
					&& ev.clientY > rect.y + boundary
					&& ev.clientX > rect.x + boundary 
					&& ev.clientX < rect.x -  boundary + rect.width) {
						ev.insideChild = true;
						return;
					}

			this._resetOffsets();
		});

  /**  Possibly modifying the drop target.
	 * Why?
	 * Due to the method used, the target gets moved out of the way and it will automatically drop onto the container element.
	 * Most drop functions in fvtt just append to the end though, when dropping onto the container.
	 * => We search for the first offset element and define that one as target. Since default for sorting is "insertBefore", and most implementations i've found build upon FVTT default/dnd5e systems default, this is a rather save implementation to find the real target.
	 */
		this.container.addEventListener('drop', ev => {
			const insideChild = ev.insideChild;
			if (this._over && !insideChild) {
				Object.defineProperty(ev, 'target', {writable: false, value: this._over})
				// Make sure that outer directories are not overwriting this stuff!
				ev.insideChild = true;
			}
		});
		
		this._items.forEach((e, idx) => this._initItem(e, idx))
	}

	async _initItem(el, idx) {
		el.style.position = "relative";
		el.addEventListener('dragenter', ev => this._onDragEnterItem(ev, idx));
		el.addEventListener('dragleave', ev => this._onDragLeaveItem(ev, idx));
		el.addEventListener('dragend', ev => {
			// safety net if for some reasons the rerender is to slow or fails...
			const srcElement = ev.currentTarget;
			srcElement.style.opacity = null;
			srcElement.style.height = null;
			TweenLite.from(srcElement, this.options.time, {opacity:0, height:0});
			this._resetOffsets();
		});
		el.addEventListener('dragstart', ev => {
			this._dragged = ev.currentTarget;
			TweenLite.to(ev.currentTarget, this.options.time, {opacity: 0, height: 0});
		})
	}

	_onDragEnterItem(ev, idx) {
		ev.stopPropagation();
		// save the current target
		this._over = this._items[idx];

		const time = this.options.time;
		const offset = this.options.offset;
		const resetList = this._items.slice(0, idx);
		TweenLite.to(resetList, time, {top: 0});
		const offsetList = this._items.slice(idx);
		TweenLite.to(offsetList, time, {top: offset});

		return false;
	}


	_onDragLeaveItem(ev, idx) {
		// Empty for now?
	}

	_resetOffsets(time = this.options.time) {
		TweenLite.to(this._items, time, {top: 0});
	}
}
