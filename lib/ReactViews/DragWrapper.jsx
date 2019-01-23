import React from 'react';
import PropTypes from 'prop-types';
import interact from 'interactjs';

class DragWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        isDragging: 0
    };
    this.resizeListener = null;
}

  componentDidMount() {
      const node = this.node;
    
      const dragMoveListener = (event)=>{
         const target = event.target;
        // keep the dragged position in the data-x/data-y attributes
         const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
         const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

         // translate the element
         target.style.webkitTransform =
         target.style.transform =
           'translate(' + x + 'px, ' + y + 'px)';

         // update the posiion attributes
         target.setAttribute('data-x', x);
         target.setAttribute('data-y', y);
         // set a threashhold for drag -> moving event to stop other interaction
         if(Math.abs(event.dx) > 5 || Math.abs(event.dy) > 5) {
            this.setState({
                isDragging: 1
            });
         }
     };

      const onend = ()=> {
          setTimeout(()=> {
              this.setState({
                  isDragging: 0
              });
          }, 100);
      };
      interact(node)
        .draggable({
          inertia: true,
          onmove: dragMoveListener,
          // keep the element within the area of it's parent
          restrict: {
              restriction: 'parent',
              endOnly: true,
              elementRect: { left: 0, right: 1, top: 0, bottom: 1 }
          },
          onend: onend
      });

  this.resizeListener = ()=> {
        // get current transform
    const currentTransformX = (parseFloat(node.getAttribute('data-x')) || 0);
    const currentTransformY = (parseFloat(node.getAttribute('data-y')) || 0);
    
    const nodeRect = node.getBoundingClientRect(); 
    let transformX = currentTransformX;
    let transformY = currentTransformY;
console.log(node.offsetLeft, node.offsetRight);
    // TODO: 
    // node.offset is the standard/threshhold
    // need to compare current nodeRectleft - nodeParentRectLeft
    // if out of bound, need to be set back to offset
    // check interact restrict for implementation
    if(node.offsetLeft <= 0 || node.offsetRight <= 0 || node.offsetTop <= 0 || node.offsetBottom <=0) {
      
      node.style.webkitTransform = 
            node.style.transform =
            'translate(' + transformX  + 'px, ' + transformY + 'px)';
    }
  };
  window.addEventListener('resize', this.resizeListener, false);
}
  
componentWillUnmount() {
    if(interact.isSet(this.node)) {
        interact(this.node).unset();
    }
    window.removeEventListener('resize', this.resizeListener, false);     
}

  render() {
      return <div data-is-dragging={this.state.isDragging} ref={node => this.node = node} >{this.props.children}</div>;
  }
}

DragWrapper.propTypes = {
	children: PropTypes.node.isRequired,
};

module.exports = DragWrapper;
