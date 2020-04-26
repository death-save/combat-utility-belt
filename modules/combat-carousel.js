class CUBCombatCarousel extends Application {
    constructor(options={}) {
        super(options);

        Hooks.once("renderCUBCombatCarousel", (app, html, data) => {
            const wrapperDiv = html.find(".wrapper");

            $(wrapperDiv).slick({
                centerMode: true,
                centerPadding: '60px',
                slidesToShow: 3,
                responsive: [
                  {
                    breakpoint: 768,
                    settings: {
                      arrows: false,
                      centerMode: true,
                      centerPadding: '40px',
                      slidesToShow: 3
                    }
                  },
                  {
                    breakpoint: 480,
                    settings: {
                      arrows: true,
                      centerMode: true,
                      centerPadding: '40px',
                      slidesToShow: 1
                    }
                  }
                ]
            });

            return;
        });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/combat-utility-belt/templates/combat-carousel.html",
            height: 300,
            width: 1000,
            id: "cub-combat-carousel",
            popOut: false,
            title: "Combat Carousel"
        });
    }

    getData() {
        return {
            combatants: game.combat.combatants
        } 
    }

    _activateListeners() {
        super._activateListeners();


    }
}