import '../assets/hyperparamSet.css';
function HyperparmSettingComponent() {
  return (
    <div id='hyperparamSetting-container'>
      <div>
        <label htmlFor='batch-size'>Batch size: </label>
        <input type='number' id='batch-size' defaultValue='512' />
      </div>
      <div>
        <label htmlFor='epochs'>Epochs: </label>
        <input type='number' id='epochs' defaultValue='20' />
      </div>
      <div>
        <label htmlFor='learning-rate'>Learning rate: </label>
        <input type='number' id='learning-rate' defaultValue='0.01' />
      </div>
    </div>
  );
}
export default HyperparmSettingComponent;