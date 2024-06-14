import '../assets/lossInfo.css';

function LossInfoComponent() {
    return (
        <>
            <div id='loss-info-container'>
                <p id='batch-info'>Batch: 0 | Loss: 0.000 | Acc: 0.000</p>
                <p id='epoch-info'>Epoch: 0 | Train, Valid Loss: 0.000, 0.000 | Train, Valid Acc: 0.000, 0.000</p>
            </div>
        </>
    );
}
export default LossInfoComponent;