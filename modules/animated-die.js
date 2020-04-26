/**
 * 
 */
class CUBAnimatedDie {
    _onRenderRollInitiative(app, html, data) {
        this.html = html;
        this.die = html.find(".die");
        this.sides = 20;
        this.initialSide = 1;
        this.lastFace = null;
        this.timeoutId = null;
        this.transitionDuration = 300;
        this.animationDuration = 1000;
      
        const listItemHref = html.find("ul > li > a");

        listItemHref.on("click", event => {
            this.reset();
            this.rollTo($(listItemHref).attr("href"));
      
            return false;
        });

        this.roll();
    }
    
    /**
     * Return a random face
     */
    randomFace() {
        const face = Math.floor(Math.random() * this.sides) + this.initialSide;
        return face;
    }

    /**
     * 
     * @param {*} face 
     */
    rollTo(face) {
        clearTimeout(this.timeoutId);

        const listItemHref = this.html.find("ul > li > a");
        const faceHref = this.html.find("[href=" + face + "]");

        listItemHref.removeClass("active");
        faceHref.addClass("active");

        this.die.attr("data-face", face);
    }

    /**
     * Reset the die
     */
    reset() {
        this.die.attr("data-face", null).removeClass("rolling");
    }

    /**
     * Roll the die
     */
    roll() {
        this.die.addClass("rolling");
        clearTimeout(this.timeoutId);

        this.timeoutId = setTimeout(() => {
            this.die.removeClass("rolling");

            this.rollTo(20);
        }, this.animationDuration);

        return false;
    }
}