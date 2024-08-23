import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess, loginFailure } from "../action/actions";
import "../styles/Login.css";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const loginResponse = await axios.post(
        "https://dev.playground.lunchlab.me/auth/sign-in",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (loginResponse.status === 200) {
        const accessToken = loginResponse.data.access_token;

        const profileResponse = await axios.get(
          "https://dev.playground.lunchlab.me/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        dispatch(loginSuccess(profileResponse.data, accessToken));
        navigate("/order-history");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        dispatch(loginFailure(error.response.data.message));
      } else {
        dispatch(loginFailure("로그인 요청 중 오류가 발생했습니다."));
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>로그인</h2>
        <div className="form-group">
          <label htmlFor="email">아이디</label>
          <input
            type="email"
            id="email"
            placeholder="아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          로그인
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
