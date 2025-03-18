export default class TooltipManager {
    constructor(scene) {
        this.scene = scene;
        this.tooltip = null;
        this.timer = null;
    }
    
    // Show a tooltip at the specified position
    show(x, y, text, options = {}) {
        // Clear any existing tooltip
        this.hide();
        
        // Default options
        const config = {
            width: 200,
            padding: 8,
            background: 0x000000,
            alpha: 0.8,
            textColor: '#ffffff',
            fontSize: 14,
            duration: 0,  // 0 means stay until hide is called
            ...options
        };
        
        // Create container for the tooltip
        this.tooltip = this.scene.add.container(x, y);
        
        // Create background
        const textObj = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: config.fontSize,
            color: config.textColor,
            wordWrap: { width: config.width - (config.padding * 2) }
        });
        
        // Size the background based on text dimensions
        const textWidth = textObj.width + (config.padding * 2);
        const textHeight = textObj.height + (config.padding * 2);
        
        // Create background
        const bg = this.scene.add.rectangle(
            textWidth / 2, 
            textHeight / 2,
            textWidth,
            textHeight,
            config.background,
            config.alpha
        );
        bg.setStrokeStyle(1, 0xffffff, 0.5);
        
        // Add child objects to container
        this.tooltip.add(bg);
        this.tooltip.add(textObj);
        
        // Center text in background
        textObj.setPosition(config.padding, config.padding);
        
        // Bring tooltip to top
        this.scene.children.bringToTop(this.tooltip);
        
        // Adjust position to keep tooltip on screen
        this.adjustPosition();
        
        // If duration is specified, auto-hide after duration
        if (config.duration > 0) {
            this.timer = this.scene.time.delayedCall(config.duration, () => {
                this.hide();
            });
        }
    }
    
    adjustPosition() {
        if (!this.tooltip) return;
        
        // Get game dimensions
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Get tooltip dimensions
        const bounds = this.tooltip.getBounds();
        
        // Check right edge
        if (bounds.right > width) {
            this.tooltip.x -= (bounds.right - width + 10);
        }
        
        // Check bottom edge
        if (bounds.bottom > height) {
            this.tooltip.y -= (bounds.bottom - height + 10);
        }
        
        // Check left edge
        if (bounds.left < 0) {
            this.tooltip.x -= bounds.left - 10;
        }
        
        // Check top edge
        if (bounds.top < 0) {
            this.tooltip.y -= bounds.top - 10;
        }
    }
    
    hide() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
        
        if (this.timer) {
            this.timer.remove();
            this.timer = null;
        }
    }
}
