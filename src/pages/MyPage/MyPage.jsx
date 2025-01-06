import Header from "../../components/Header/Header";
import logoImage from "../../assets/images/logoImage.svg";
import useDevice from "../../hooks/useDevice";
import styles from "./MyPage.module.scss";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getIdolData } from "../../api";
import leftIcon from "../../assets/icons/lefticon.png";
import rightIcon from "../../assets/icons/righticon.png";
import plusIcon from "../../assets/icons/plusIcon.png";
import IdolCard from "../../components/IdolCard/IdolCard";
import CustomButton from "../../components/CustomButtom/CustomButton";
import Refresh from "../../components/Refresh/Refresh";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../../components/Footer/Footer";
import backgroundImg from "../../assets/images/Vector 3.png";
import MyPageLoading from "./MyPageLoading";

function MyPage() {
  const { mode } = useDevice();

  /**
   * 관심있는 아이돌
   * 상태값으로 관리할 필요가 없음.
   * localstorage에 저장하고, 불러와서 사용하면 됨
   */
  // const [favoriteIdolList, setFavoriteIdolList] = useState([]);
  const favoriteIdolList = JSON.parse(
    localStorage.getItem("favoriteIdol") || "[]"
  );

  /**
   * 서버에서 받아온 아이돌 데이터를 저장하고 있음
   * 한번 받아온 아이돌은 계속해서 저장하고 있음
   */
  const [idolList, setIdolList] = useState([]);

  /**
   * 페이지 커서를 저장하고 있음
   * stack 으로 쌓이는 구조
   * ex) [cursor1, cursor2, cursor3, cursor4, ...]
   */
  const [cursors, setCursors] = useState([]);

  /**
   * 현재 페이지
   */
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * mode 에 따라서 PageSize가 결정됨
   *
   * mode가 tablet인 경우 8
   * mode가 mobile인 경우 6
   * 그 외의 경우 16
   */
  const pageSize = useMemo(() => {
    if (mode === "tablet") {
      return 8;
    } else if (mode === "mobile") {
      return 6;
    }

    return 16;
  }, [mode]);

  /**
   * NextCursor는 따로 필요하지 않음
   * cursors 를 통해서 다음 커서 값을 알 수 있기 떄문임
   * 중복된 상태값은 최대한 줄이는게 좋음
   */
  // const [nextCursor, setNextCursor] = useState(null); //다음 페이지 커서

  const [selectedIdols, setSelectedIdols] = useState([]); // 선택된 아이돌
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 화면에 노출될 아이돌 리스트
   * 상태값으로 관리하는게 아니라 전체 아이돌 리스트에서 page와 favoriteIdolList를 통해 계산해서 반환하면 됨
   * 따로 상태값으로 관리하게되면 중복된 상태값이 생기게 됨
   *
   * 그래서 주석처리함
   */
  // const [displayIdolList, setDisplayIdolList] = useState([]);

  /**
   * 화면에 노출될
   */
  const displayIdolList = useMemo(() => {
    // TODO: idolList 에서 page랑 favoriteIdolList 해서 반환할것
    const excludeIdolList = idolList.filter(
      (i) => !favoriteIdolList.map((i) => i.id).includes(i.id)
    );

    // currentPage 와 pageSize를 이용해서 계산
    const start = currentPage * pageSize;
    const end = start + pageSize;

    return excludeIdolList.slice(start, end);
  }, [currentPage, favoriteIdolList, idolList, pageSize]);

  /** cursor 없이 호출하면 자동으로 null, cursor와 함께 호출하면 cursor 값 사용 */
  const fetchIdolList = useCallback(async ({ size, cursor }) => {
    setIsLoading(true);
    try {
      const idolData = await getIdolData({
        pageSize: size,
        cursor,
      });

      if (idolData && idolData.list) {
        setIdolList((prev) => [...prev, ...idolData.list]);
        setError(null);

        // 현재 커서 히스토리에 저장하기.
        setCursors((prev) => {
          return [...prev, idolData.nextCursor];
        });
      }
    } catch (error) {
      console.error("fetch 실패", error);
      setIdolList([]);
      setError(error);
      setIsLoading(false);
      setSelectedIdols([]);
      localStorage.removeItem("selectedIdols");
    } finally {
      setIsLoading(false); // 데이터 fetching 완료 후 false로 설정
    }
  }, []);

  useEffect(() => {
    if (displayIdolList.length === pageSize) {
      // NOTE: 화면에 보여야 할 내용이 충분히 다 보임
      return;
    }

    const fetchCount = pageSize - displayIdolList.length;
    const cursor = cursors.length === 0 ? null : cursors[cursors.length - 1];

    fetchIdolList({ size: fetchCount, cursor });
  }, [cursors, displayIdolList.length, fetchIdolList, pageSize]);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const isTouchDevice = () =>
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const handleStart = (e) => {
    if (isTouchDevice()) {
      touchStartX.current = e.touches[0].clientX;
    } else {
      touchStartX.current = e.clientX; // 마우스 이벤트의 경우
    }
    touchEndX.current = null;
  };

  const handleMove = (e) => {
    if (isTouchDevice()) {
      touchEndX.current = e.touches[0].clientX;
    } else {
      touchEndX.current = e.clientX; // 마우스 이벤트의 경우
    }
  };

  const handleEnd = () => {
    if (!touchStartX.current || touchEndX.current === null) return;

    const difference = touchStartX.current - touchEndX.current;
    const threshold = window.innerWidth * 0.1; // 화면 너비의 20%로 설정

    if (difference > threshold) {
      handleNextPage(); // 다음 페이지
    } else if (difference < -threshold && currentPage > 0) {
      handlePrevPage(); // 이전 페이지
    }

    // 초기화
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (mode === "mobile") {
      if (isTouchDevice()) {
        window.addEventListener("touchstart", handleStart);
        window.addEventListener("touchmove", handleMove);
        window.addEventListener("touchend", handleEnd);
      }
    } else {
      window.addEventListener("mousedown", handleStart);
      window.addEventListener("mousemove", (e) => {
        if (e.buttons === 1) handleMove(e);
      });
      window.addEventListener("mouseup", handleEnd);
    }

    return () => {
      // 모든 이벤트 리스너 제거
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("mousedown", handleStart);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
    };
  }, [mode]); // mode를 종속성 배열에 추가

  /** 이전 페이지 누를 때 */
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  /** 다음페이지 누를 때 */
  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  /** x버튼 누를 때 */
  const handleDelete = (id) => {
    const storedData = localStorage.getItem("favoriteIdol");
    if (storedData) {
      const storedIdols = JSON.parse(storedData);
      const updatedStoredIdols = storedIdols.filter((idol) => idol.id !== id);
      localStorage.setItem("favoriteIdol", JSON.stringify(updatedStoredIdols));
    }

    toast.success("삭제 완료!", {
      position: "top-right",
    });
  };

  /** 이미지 누를 때 클릭핸들러 */
  const handleClick = (idol) => {
    setSelectedIdols((prev) => {
      const newSelectedIds = prev.includes(idol.id)
        ? prev.filter((id) => id !== idol.id)
        : [...prev, idol.id];

      // localStorage에서 기존 선택된 아이돌들 가져오기
      const storedSelectedIdols = JSON.parse(
        localStorage.getItem("selectedIdols") || "[]"
      );

      if (prev.includes(idol.id)) {
        // 선택 해제하는 경우: localStorage에서도 제거
        const updatedSelectedIdols = storedSelectedIdols.filter(
          (storedIdol) => storedIdol.id !== idol.id
        );
        localStorage.setItem(
          "selectedIdols",
          JSON.stringify(updatedSelectedIdols)
        );
      } else {
        // 선택하는 경우: localStorage에 추가
        const updatedSelectedIdols = [...storedSelectedIdols, idol];
        localStorage.setItem(
          "selectedIdols",
          JSON.stringify(updatedSelectedIdols)
        );
      }

      return newSelectedIds;
    });
  };

  /** 추가하기 버튼 누를 때 */
  const handleAddClick = () => {
    // 클릭한 아이돌데이터 selectedIdolsData에 넣어주고
    const selectedIdolsData = JSON.parse(
      localStorage.getItem("selectedIdols") || "[]"
    );
    const storedData = localStorage.getItem("favoriteIdol");
    const storedIdols = storedData ? JSON.parse(storedData) : [];

    //combinedIdols에 localstorage에 있던 데이터 넣어주고
    const combinedIdols = [...storedIdols];
    // 새롭게 선택된 데이터 넣어주기.
    selectedIdolsData.forEach((idol) => {
      if (!combinedIdols.some((item) => item.id === idol.id)) {
        combinedIdols.push(idol);
      }
    });

    localStorage.setItem("favoriteIdol", JSON.stringify(combinedIdols));

    // combinedIdols에 있는 id와 일치하지 않는 아이돌만 남기기
    // combinedIdols에 있는 id와 IdolList에 있는 id의 중복이 없는 경우에만 새 아이돌을 추가함.
    let newIdolList = idolList.filter(
      (idol) =>
        !combinedIdols.some((selectedIdol) => selectedIdol.id === idol.id)
    );
    setIdolList(newIdolList);

    //선택된 아이돌 초기화
    localStorage.removeItem("selectedIdols");
    setSelectedIdols([]);

    toast.success("추가 완료!", {
      position: "top-right",
    });
  };

  console.log(idolList, displayIdolList);

  return (
    <div>
      <Header />
      <img
        style={{ position: "absolute", top: "0", zIndex: "9" }}
        src={backgroundImg}
        alt="배경그라데이션"
      />
      <main className={styles.mypage__main}>
        <section className={styles.favorite_section}>
          <h2 className={styles.section__title}>내가 관심있는 아이돌</h2>
          <div className={styles.favorite__container}>
            <div className={styles.favorite__empty}>
              {favoriteIdolList.length === 0 && (
                <div className={styles.favorite__empty__container}>
                  <img
                    src={logoImage}
                    className={styles.favorite__empty_image}
                    alt="빈 상태 이미지"
                  />
                  <p className={styles.favorite__empty_text}>
                    좋아하는 아이돌을 추가해보세요.
                  </p>
                </div>
              )}
              <ul className={`${styles.favorite_idol_list} ${styles[mode]}`}>
                {favoriteIdolList.map((idol) => (
                  <li key={idol.id}>
                    <IdolCard
                      imageUrl={idol.profilePicture}
                      name={idol.name}
                      group={idol.group}
                      isbig={false}
                      onDelete={() => handleDelete(idol.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className={styles.mypage__divider_container}>
          <hr className={styles.mypage__divider} aria-hidden="true" />
        </div>
        <section className={styles.add_section}>
          <h2 className={styles.section__title}>
            관심 있는 아이돌을 추가해보세요.
          </h2>
          {error ? (
            <Refresh handleLoad={fetchIdolList} height={402} />
          ) : !isLoading ? (
            <div className={styles.add_idol_wrap}>
              {mode !== "mobile" && (
                <button
                  className={styles.card_handleButton}
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                >
                  <img
                    className={styles.card_handleButton_img}
                    src={leftIcon}
                    alt="왼쪽 버튼"
                  />
                </button>
              )}

              <ul
                className={`${styles.add_idol_list} ${styles[mode]}`}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleStart} // 마우스 이벤트 추가
                onMouseMove={(e) => {
                  if (e.buttons === 1) handleMove(e); // 마우스를 누르고 이동할 때만 처리
                }}
                onMouseUp={handleEnd}
              >
                {displayIdolList.map((idol) => (
                  <li key={idol.id}>
                    <IdolCard
                      imageUrl={idol.profilePicture}
                      name={idol.name}
                      group={idol.group}
                      isbig={true}
                      onClick={() => handleClick(idol)}
                      isClicked={selectedIdols.includes(idol.id)}
                    />
                  </li>
                ))}
              </ul>
              {mode !== "mobile" && (
                <button
                  className={styles.card_handleButton}
                  onClick={handleNextPage}
                >
                  <img
                    className={styles.card_handleButton_img}
                    src={rightIcon}
                    alt="오른쪽 버튼"
                  />
                </button>
              )}
            </div>
          ) : (
            /** 여기 skeleton UI 구현 */
            <div className={styles.add_idol_wrap}>
              <button className={styles.card_handleButton} disabled={true}>
                <img
                  className={styles.card_handleButton_img}
                  src={leftIcon}
                  alt="왼쪽 버튼"
                />
              </button>

              <ul className={`${styles.add_idol_list} ${styles[mode]}`}>
                {[
                  ...Array(mode === "mobile" ? 6 : mode === "tablet" ? 8 : 16),
                ].map((_, index) => (
                  <li
                    key={`skeleton-${index}`}
                    className={styles.add_idol__container}
                  >
                    <div className={styles.idol_card_skeleton}>
                      <div className={styles.skeleton_image}>
                        <MyPageLoading width="128px" height="128px" />
                      </div>
                      <div className={styles.add_idol_p__container}>
                        <div className={styles.skeleton_name}>
                          <MyPageLoading width="80px" height="16px" />
                        </div>
                        <div className={styles.skeleton_group}>
                          <MyPageLoading width="80px" height="14px" />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button className={styles.card_handleButton} disabled={true}>
                <img
                  className={styles.card_handleButton_img}
                  src={rightIcon}
                  alt="오른쪽 버튼"
                />
              </button>
            </div>
          )}
        </section>
        <section className={styles.add_idol_button_section}>
          {!isLoading && !error && (
            <CustomButton
              width={255}
              height={48}
              isRoundButton={true}
              onClick={handleAddClick}
            >
              <div className={styles.add_idol_button_content}>
                {" "}
                <img
                  src={plusIcon}
                  className={styles.add_idol_button_icon}
                  alt="플러스아이콘"
                />
                <span className={styles.add_idol_button_text}>추가하기</span>
              </div>
            </CustomButton>
          )}
        </section>
      </main>
      <ToastContainer />
      <Footer />
    </div>
  );
}

export default MyPage;
