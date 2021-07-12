import './index.css';

const Backdrop = (props) => (
  <div className='backdrop' onClick={props.onCancel}></div>
);

export default Backdrop;
