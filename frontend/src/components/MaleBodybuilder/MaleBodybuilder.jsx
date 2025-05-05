import "./Products.css";
import Male_bodybuilder from "../../assets/img/arnold_wooden_stand_2.png"

const MaleBodybuilder = () => {
    return(
        <>
            <div class="body_of_product_info">

<div class="main-container">
    <div class="image-section">
    <model-viewer
    id="ballViewer"
    src="/3dObj/male_bodybuilder/another_stand.gltf"
    shadow-intensity="1"
    autoplay
    camera-orbit="-90deg 75deg "
    camera-controls
    disable-zoom
    poster={Male_bodybuilder}
    
    >
  </model-viewer>
        
    </div>

    <div class="description-section">
            <div class="heading-block">
              <h1>Male bodubuilder with your name</h1>
              <p>The perfect gift for gym bro. Customize it with person name!</p>
            </div>
      
            <div class="features-list">
              <div class="feature-element">
                  <div class="feature-icon">🔠</div>
                  <div class="feature-details">
                      <h3>Personalized Name</h3>
                      <p>Engrave the name of your loved one or a special friend for a unique touch.</p>
                  </div>
              </div>

              <div class="feature-element">
                  <div class="feature-icon">🎁</div>
                  <div class="feature-details">
                      <h3>A Gift Like No Other</h3>
                      <p>Every man will love it! Surprise them with a one-of-a-kind present.</p>
                  </div>
              </div>

              <div class="feature-element">
                  <div class="feature-icon">🔥</div>
                  <div class="feature-details">
                      <h3>Boost Confidence & Motivation</h3>
                      <p>Highlight your boyfriend’s strength and style with a meaningful keepsake.</p>
                  </div>
              </div>

              <div class="feature-element">
                  <div class="feature-icon">♻️</div>
                  <div class="feature-details">
                      <h3>Eco-Friendly Choice</h3>
                      <p>Made from sustainable PLA material, safe for both you and the planet.</p>
                  </div>
              </div>
          </div>

          <div class="purchase-section">
              <div class="price-tag">59zł</div>
              <button class="purchase-button">Buy Now</button>
          </div>

          </div>

</div>
</div>
        </>
    )
}

export default MaleBodybuilder;