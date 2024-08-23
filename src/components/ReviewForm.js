import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useWheelScroll } from "../hooks/useWheelScroll";
import "../styles/ReviewForm.css";

function ReviewForm({ menu, orderId, onClose }) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(null);
  const [images, setImages] = useState([]);
  const imagePreviewRef = useWheelScroll();
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const token = useSelector((state) => state.auth.token);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (images.length < 6 && file) {
      setImages([...images, file]);
    } else {
      alert("이미지는 최대 6개까지 추가할 수 있습니다.");
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  useEffect(() => {
    if (rating && reviewText.length >= 1 && reviewText.length <= 1000) {
      setIsSubmitEnabled(true);
    } else {
      setIsSubmitEnabled(false);
    }
  }, [rating, reviewText]);

  const handleSubmit = async () => {
    if (isSubmitEnabled) {
      try {
        const payload = {
          summary: rating,
          content: reviewText,
          picture: images.map((image) => URL.createObjectURL(image)),
        };

        await axios.post(
          `https://dev.playground.lunchlab.me/order-history/${orderId}/review`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        onClose(true);
      } catch (error) {
        console.error("리뷰 제출 실패:", error);
      }
    }
  };

  return (
    <div className="review-form-container">
      <div className="review-header">
        <h3>리뷰 쓰기</h3>
        <button onClick={() => onClose(false)} className="close-button">
          X
        </button>
      </div>
      <div className="review-menu">
        <img src={menu.picture} alt={menu?.name} className="menu-icon" />
        <span>{menu?.name}</span>
      </div>
      <div className="rating-section">
        <button
          className={`rating-btn ${rating === "like" ? "selected" : ""}`}
          onClick={() => setRating("like")}
        >
          👍 좋았어요
        </button>
        <button
          className={`rating-btn ${rating === "unlike" ? "selected" : ""}`}
          onClick={() => setRating("unlike")}
        >
          👎 별로에요
        </button>
      </div>
      <textarea
        className="review-textarea"
        placeholder="음식에 대한 솔직한 리뷰를 남겨주세요. 더 좋은 서비스를 보답해드리겠습니다."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        maxLength={1000}
      />
      <div className="char-counter">{reviewText.length}/1000</div>
      <div className="image-upload-section">
        <label className="image-upload-btn">
          📷
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        <div className="image-preview-section" ref={imagePreviewRef}>
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <img
                src={URL.createObjectURL(image)}
                alt={`preview-${index}`}
                className="image-thumbnail"
              />
              <button
                className="remove-image-btn"
                onClick={() => handleRemoveImage(index)}
              >
                −
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!isSubmitEnabled}
      >
        완료
      </button>
    </div>
  );
}

export default ReviewForm;
