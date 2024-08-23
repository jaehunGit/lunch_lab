import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "../styles/ReviewDetail.css";
import { useWheelScroll } from "../hooks/useWheelScroll";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

function ReviewDetail({ orderId, menu, review, onClose }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const imagePreviewRef = useWheelScroll();

  if (!review) {
    return <p>리뷰를 불러오는 중...</p>;
  }

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `https://dev.playground.lunchlab.me/order-history/${orderId}/review`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onClose(true);
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
    }
  };

  return (
    <div className="review-detail-container">
      <div className="review-header">
        <h3>내가 쓴 리뷰</h3>
        <button onClick={() => onClose(false)} className="close-button">
          X
        </button>
      </div>
      <div className="review-menu">
        <img src={menu.picture} alt={menu.name} className="menu-icon" />
        <span>{menu.name}</span>
      </div>
      <div className="review-content">
        <div className="review-summary">
          {review.summary === "like" ? "👍 좋았어요" : "👎 별로에요"}
        </div>
        <p>{review.content}</p>
        <p className="photo-label">사진</p>
        <div className="review-images" ref={imagePreviewRef}>
          {review.picture.map((url, index) => (
            <div key={index} className="image-container">
              <img
                src={url}
                alt={`리뷰 사진 ${index + 1}`}
                className="review-image"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="delete-button-container">
        <Button
          variant="contained"
          color="error"
          onClick={() => setShowDeleteConfirm(true)}
          className="delete-button"
        >
          삭제
        </Button>
      </div>
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogTitle>리뷰 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            작성한 리뷰를 삭제합니다. 계속하시겠어요?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirm} color="error">
            예
          </Button>
          <Button onClick={() => setShowDeleteConfirm(false)} color="primary">
            아니오
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ReviewDetail;
