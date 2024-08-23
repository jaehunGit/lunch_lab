import React, { useState, useEffect, useRef } from "react";
import "../styles/Calendar.css";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReviewForm from "./ReviewForm";
import ReviewDetail from "./ReviewDetail";

function Calendar() {
  const today = new Date();
  const [visibleDates, setVisibleDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [orderDates, setOrderDates] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [review, setReview] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isReviewDetailMode, setIsReviewDetailMode] = useState(false);
  const dateContainerRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get(
        "https://dev.playground.lunchlab.me/order-history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetchedOrderDates = response.data.map((order) => ({
        date: new Date(order.orderDate).toDateString(),
        ...order,
      }));
      setOrderDates(fetchedOrderDates);
    } catch (error) {
      console.error("Failed to fetch order history", error);
    }
  };

  const initializeVisibleDates = (centerDate) => {
    let dates = [];
    for (let i = -3; i <= 3; i++) {
      let newDate = new Date(centerDate);
      newDate.setDate(centerDate.getDate() + i);
      dates.push(newDate);
    }
    setVisibleDates(dates);
    updateCurrentMonth(dates);
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    initializeVisibleDates(date);

    const orderForSelectedDate = orderDates.find(
      (order) => order.date === date.toDateString()
    );

    if (orderForSelectedDate) {
      try {
        const response = await axios.get(
          `https://dev.playground.lunchlab.me/order-history/${orderForSelectedDate.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              with: ["menu", "review"],
            },
          }
        );

        const selectedMenu = response.data.menu;
        if (selectedMenu) {
          setSelectedOrder(selectedMenu);
          setOrderId(orderForSelectedDate.id);
        } else {
          setSelectedOrder(null);
        }

        const fetchedReview = response.data.review;
        setReview(fetchedReview || null);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSelectedOrder(null);
      setReview(null);
      setOrderId(null);
    }
  };

  const handleViewReviewDetail = async () => {
    if (orderId) {
      try {
        const response = await axios.get(
          `https://dev.playground.lunchlab.me/order-history/${orderId}/review`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReview(response.data);
        setIsReviewDetailMode(true);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleWheelScroll = (event) => {
    const direction = event.deltaY > 0 ? "right" : "left";
    let newDates = [...visibleDates];
    if (direction === "left") {
      let newDate = new Date(visibleDates[0]);
      newDate.setDate(visibleDates[0].getDate() - 1);
      newDates.unshift(newDate);
      newDates.pop();
    } else if (direction === "right") {
      let newDate = new Date(visibleDates[visibleDates.length - 1]);
      newDate.setDate(newDate.getDate() + 1);
      newDates.push(newDate);
      newDates.shift();
    }
    setVisibleDates(newDates);
    updateCurrentMonth(newDates);
  };

  const centerSelectedDate = () => {
    if (dateContainerRef.current) {
      const selectedElement =
        dateContainerRef.current.querySelector(".selected");
      if (selectedElement) {
        const containerWidth = dateContainerRef.current.offsetWidth;
        const selectedElementLeft = selectedElement.offsetLeft;
        const selectedElementWidth = selectedElement.offsetWidth;
        const scrollPosition =
          selectedElementLeft - containerWidth / 2 + selectedElementWidth / 2;
        dateContainerRef.current.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  };

  const updateCurrentMonth = (dates) => {
    const monthCount = {};
    dates.forEach((date) => {
      const month = date.getMonth() + 1;
      if (!monthCount[month]) {
        monthCount[month] = 0;
      }
      monthCount[month]++;
    });

    for (let month in monthCount) {
      if (monthCount[month] >= 4) {
        setCurrentMonth(month);
        break;
      }
    }
  };

  const getDayName = (date) => {
    return date.toDateString() === today.toDateString()
      ? "오늘"
      : date.toLocaleDateString("ko-KR", { weekday: "short" });
  };

  const isOrderDate = (date) => {
    return orderDates.some((order) => order.date === date.toDateString());
  };

  useEffect(() => {
    initializeVisibleDates(today);
    fetchOrderHistory();
  }, []);

  useEffect(() => {
    centerSelectedDate();
  }, [selectedDate]);

  useEffect(() => {
    if (token) {
      fetchOrderHistory();
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="calendar-container">
      {isReviewMode ? (
        <ReviewForm
          menu={selectedOrder}
          orderId={orderId}
          onClose={(reviewUpdated) => {
            setIsReviewMode(false);
            if (reviewUpdated) {
              handleDateClick(selectedDate);
            }
          }}
        />
      ) : isReviewDetailMode ? (
        <ReviewDetail
          orderId={orderId}
          menu={selectedOrder}
          review={review}
          onClose={(reviewDeleted) => {
            setIsReviewDetailMode(false);
            if (reviewDeleted) {
              fetchOrderHistory().then(() => handleDateClick(selectedDate));
            }
          }}
        />
      ) : (
        <>
          <h2>주문내역</h2>
          <div className="month-display">{currentMonth}월</div>
          <div
            className="date-grid"
            ref={dateContainerRef}
            onWheel={handleWheelScroll}
          >
            {visibleDates.map((date, index) => (
              <div
                key={index}
                className={`date-item ${
                  date.getTime() === selectedDate.getTime() ? "selected" : ""
                } ${isOrderDate(date) ? "order-date" : ""}`}
                onClick={() => handleDateClick(date)}
              >
                <div className="day-name">{getDayName(date)}</div>
                <div>{`${date.getDate()}일`}</div>
              </div>
            ))}
          </div>
          <div className="order-details">
            {selectedOrder ? (
              <div>
                <img src={selectedOrder.picture} alt={selectedOrder.name} />
                <h2>{selectedOrder?.name}</h2>
                <div>{selectedOrder?.description}</div>
                <h3>원산지</h3>
                <div>{selectedOrder?.origin}</div>
                {review ? (
                  <div className="review-section">
                    <div className="review-complete">✔ 리뷰 작성 완료</div>
                    <button
                      className="review-view-btn"
                      onClick={handleViewReviewDetail}
                    >
                      내가 쓴 리뷰 보기
                    </button>
                  </div>
                ) : (
                  <button
                    className="review-write-btn"
                    onClick={() => setIsReviewMode(true)}
                  >
                    리뷰 쓰기
                  </button>
                )}
              </div>
            ) : (
              <p>식사를 주문하지 않으셨습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Calendar;
