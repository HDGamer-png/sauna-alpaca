'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './SaunaChair3DViewer.module.css';

// 4 Phác đồ xông chuyên biệt Cố Đô
interface TherapyPreset {
  id: string;
  name: string;
  icon: string;
  temp: number;
  timer: number;
  firLevel: number;
  desc: string;
  badge: string;
}

const THERAPY_PRESETS: TherapyPreset[] = [
  {
    id: 'detox',
    name: 'Thải Độc Thận & Dẫn Lưu',
    icon: '🍃',
    temp: 46,
    timer: 35,
    firLevel: 4,
    desc: 'Kích thích mao mạch vùng thắt lưng, tăng sinh Oxit Nitric (NO) hỗ trợ dẫn lưu thận và bài tiết axit uric.',
    badge: 'Chuyên khoa thận',
  },
  {
    id: 'spine',
    name: 'Giảm Đau Cột Sống L4-L5',
    icon: '🦴',
    temp: 43,
    timer: 30,
    firLevel: 3,
    desc: 'Sóng nhiệt FIR 5.6-15µm thẩm thấu 3-5cm làm mềm cơ thắt lưng, giải tỏa áp lực chèn ép rễ thần kinh.',
    badge: 'Phục hồi đĩa đệm',
  },
  {
    id: 'sleep',
    name: 'Ngủ Ngon Cố Đô',
    icon: '🌙',
    temp: 40,
    timer: 20,
    firLevel: 2,
    desc: 'Nhiệt mộc dịu êm kết hợp hương thơm gỗ tự nhiên, an dịu hệ thần kinh giao cảm giúp sâu giấc nhanh.',
    badge: 'Dưỡng tâm an thần',
  },
  {
    id: 'deep',
    name: 'Xông Sâu Đốt Mỡ FIR',
    icon: '🔥',
    temp: 50,
    timer: 45,
    firLevel: 5,
    desc: 'Kích hoạt chuyển hóa tế bào đỉnh cao, bài tiết 500-800ml mồ hôi sâu và giải phóng calo tự nhiên.',
    badge: 'Đốt mỡ tăng cường',
  },
];

// Các điểm ghim Hotspot thông minh trên ảnh thật anh_tk3D.jpg
interface ChairHotspot {
  id: string;
  title: string;
  desc: string;
  tag: string;
  x: number; // Tọa độ %
  y: number; // Tọa độ %
  isConsole?: boolean;
}

const CHAIR_HOTSPOTS: ChairHotspot[] = [
  {
    id: 'armrest_console',
    title: 'Bảng Điều Khiển Cảm Ứng OLED',
    desc: 'Màn hình cảm ứng gắn trên tay vịn gỗ, điều chỉnh nhiệt độ 38°C - 52°C và 4 vùng nhiệt độc lập.',
    tag: 'Bấm để tùy chỉnh',
    x: 45.2,
    y: 38.6,
    isConsole: true,
  },
  {
    id: 'overhead_dome',
    title: 'Tấm Nhiệt Vòm Trên (Overhead FIR)',
    desc: 'Tấm nhiệt cong đa hướng gắn tay đòn khớp xoay, phủ bức xạ hồng ngoại cho vùng đầu, cổ và vai gáy.',
    tag: 'Tấm nhiệt FIR 4K',
    x: 46.5,
    y: 18.5,
  },
  {
    id: 'backrest_core',
    title: 'Lõi Nhiệt Carbon Crystal Lưng Ghế',
    desc: 'Bức xạ nhiệt hồng ngoại xa thẩm thấu sâu 3-5cm, tác động trực tiếp vào vùng thận và cột sống L4-L5.',
    tag: 'Lõi nhiệt sinh học',
    x: 68.0,
    y: 38.0,
  },
  {
    id: 'lower_leg_fir',
    title: 'Tấm Nhiệt Bắp Chân & Chi Dưới',
    desc: 'Sưởi ấm kinh lạc chi dưới, giảm tình trạng lạnh bàn chân, tê bì và thúc đẩy tuần hoàn máu về tim.',
    tag: 'Dẫn lưu chi dưới',
    x: 35.8,
    y: 57.5,
  },
  {
    id: 'wooden_frame',
    title: 'Khung Ghế Gỗ Tự Nhiên & Lưới Thoáng Khí',
    desc: 'Thiết kế công thái học Zero-Gravity ngả lưng 120° giải phóng áp lực đĩa đệm, lưới chịu nhiệt êm ái.',
    tag: 'Zero-Gravity 120°',
    x: 55.5,
    y: 67.5,
  },
];

// Âm thanh phản hồi cảm ứng xúc giác (Web Audio API)
const playCapacitiveBeep = (freq = 880, duration = 0.05) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Không làm phiền nếu trình duyệt chặn tự phát âm
  }
};

export function SaunaChair3DViewer() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trạng thái Bảng điều khiển (Control Console)
  const [isConsoleModalOpen, setIsConsoleModalOpen] = useState(false);
  const [isHeatingOn, setIsHeatingOn] = useState(true);
  const [tempSetting, setTempSetting] = useState(43);
  const [timerSetting, setTimerSetting] = useState(30);
  const [activeTherapy, setActiveTherapy] = useState<string>('spine');
  const [firLevel, setFirLevel] = useState(3);

  // Trạng thái bật/tắt từng vùng nhiệt độc lập
  const [activeZones, setActiveZones] = useState({
    backrest: true,
    overhead: true,
    legs: true,
    side: true,
  });

  // Trạng thái Hotspot đang mở thẻ thông tin
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  // Hiệu ứng Parallax 3D khi rê chuột trên ảnh 4K (tỷ lệ scale 1.04 - 1.06 đảm bảo không bao giờ hở mép)
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1.03)',
  });

  // Tọa độ chuột cho các hiệu ứng
  const [ambientLightPos, setAmbientLightPos] = useState({ x: 50, y: 50 });
  const [mousePixels, setMousePixels] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Xử lý Parallax và hiệu ứng khi rê chuột
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsHovering(true);
    setMousePixels({ x, y });

    const percX = Math.min(100, Math.max(0, Math.round((x / rect.width) * 100)));
    const percY = Math.min(100, Math.max(0, Math.round((y / rect.height) * 100)));
    setAmbientLightPos({ x: percX, y: percY });

    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -2.8;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 2.8;
    
    setTiltStyle({
      transform: `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.06)`,
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTiltStyle({
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1.03)',
    });
    setAmbientLightPos({ x: 50, y: 50 });
  };

  // Mở Bảng điều khiển khi bấm vào bảng điều khiển trên ghế
  const handleOpenConsole = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCapacitiveBeep(1200, 0.08);
    setActiveHotspotId(null);
    setIsConsoleModalOpen(true);
  };

  // Tăng/giảm nhiệt độ
  const handleTempUp = () => {
    playCapacitiveBeep(1046);
    if (!isHeatingOn) setIsHeatingOn(true);
    setTempSetting((t) => Math.min(52, t + 1));
  };

  const handleTempDown = () => {
    playCapacitiveBeep(784);
    if (!isHeatingOn) setIsHeatingOn(true);
    setTempSetting((t) => Math.max(38, t - 1));
  };

  // Chọn phác đồ xông
  const handleSelectTherapy = (preset: TherapyPreset) => {
    playCapacitiveBeep(920);
    setActiveTherapy(preset.id);
    setTempSetting(preset.temp);
    setTimerSetting(preset.timer);
    setFirLevel(preset.firLevel);
    setIsHeatingOn(true);
  };

  // Bật/tắt nguồn xông
  const handleTogglePower = () => {
    playCapacitiveBeep(isHeatingOn ? 440 : 880, 0.1);
    setIsHeatingOn(!isHeatingOn);
  };

  // Bật/tắt từng vùng nhiệt
  const handleToggleZone = (zone: keyof typeof activeZones) => {
    playCapacitiveBeep(850);
    setActiveZones((prev) => ({ ...prev, [zone]: !prev[zone] }));
  };

  const activePresetData = THERAPY_PRESETS.find((p) => p.id === activeTherapy) || THERAPY_PRESETS[0];

  return (
    <div className={styles.viewerWrapper}>
      {/* 🌟 HÀO QUANG NHIỆT / KHÚC XẠ HẮT SÁNG RA NGOÀI HERO */}
      {isHeatingOn && (
        <div
          className={styles.ambientBacklightGlow}
          style={{
            background: `radial-gradient(ellipse at ${ambientLightPos.x}% ${ambientLightPos.y}%, rgba(56, 189, 248, 0.45) 0%, rgba(245, 158, 11, 0.25) 42%, rgba(14, 165, 233, 0.12) 65%, transparent 85%)`,
          }}
        />
      )}

      <div
        className={styles.viewerContainer}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ──── THANH TRÊN CÙNG: BADGE THÔNG TIN ──── */}
        <div className={styles.topBar}>
          <div className={styles.modelBadge}>
            <span
              className={`${styles.modelBadgeDot} ${isHeatingOn ? styles.modelBadgeDotHeating : ''}`}
            />
            <span className={styles.modelBadgeText}>
              <span className={styles.modelBadgeTextDesktop}>
                {isHeatingOn
                  ? `ALPACA-FIR-01 • ${activePresetData.name.toUpperCase()} (${tempSetting}°C)`
                  : 'ALPACA-FIR-01 • CHẾ ĐỘ CHỜ (STANDBY)'}
              </span>
              <span className={styles.modelBadgeTextMobile}>
                {isHeatingOn
                  ? `ALPACA-FIR • ${tempSetting}°C`
                  : 'ALPACA-FIR • CHẾ ĐỘ CHỜ'}
              </span>
            </span>
          </div>
        </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          KHUNG HÌNH 4K: CHIẾC GHẾ XÔNG HƠI CHÍNH THỨC (ANH_TK3D.JPG)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.photoStage} style={tiltStyle}>
        <div className={styles.photoImageWrapper}>
          <Image
            src="/images/anh_tk3D.jpg"
            alt="Ghế Xông Hơi Hồng Ngoại Xa Alpaca - Thiết kế 3D 4K Độc Bản"
            fill
            priority
            sizes="(max-width: 960px) 100vw, 680px"
            className={styles.chairPhoto}
            draggable={false}
          />

          {/* Lớp thở nhiệt quang học FIR ấm áp khi đang bật xông */}
          {isHeatingOn && (
            <>
              {/* Tấm nhiệt vòm trên */}
              <div className={`${styles.thermalAura} ${styles.thermalOverhead}`} />
              {/* Tấm nhiệt lưng ghế */}
              <div className={`${styles.thermalAura} ${styles.thermalBackrest}`} />
              {/* Tấm nhiệt bắp chân */}
              <div className={`${styles.thermalAura} ${styles.thermalLegs}`} />
              {/* Toàn cảnh hào quang nhiệt FIR */}
              <div className={styles.globalFirBreathe} />
            </>
          )}

          {/* 💧 HIỆU ỨNG CHÍNH THỨC: KHÚC XẠ THỦY TINH & LĂN TĂN HƠI NƯỚC (LIQUID PRISM REFRACTION) */}
          <div className={styles.liquidRefractionWrapper}>
            {/* Lưới phản quang caustics nước khoáng lướt theo chuột */}
            <div
              className={styles.liquidCausticsOverlay}
              style={{
                background: `radial-gradient(circle 380px at ${ambientLightPos.x}% ${ambientLightPos.y}%, rgba(186, 230, 253, 0.28) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 70%)`,
              }}
            />

            {/* Thấu kính chất lỏng & gợn sóng khúc xạ di chuyển theo trỏ chuột */}
            {isHovering && (
              <div
                className={styles.liquidGlassLens}
                style={{
                  left: `${mousePixels.x}px`,
                  top: `${mousePixels.y}px`,
                }}
              >
                <div className={styles.liquidWave1} />
                <div className={styles.liquidWave2} />
                <div className={styles.liquidWave3} />
                <div className={styles.liquidSpecularGloss} />
                <div className={styles.liquidPrismDispersion} />
                <span className={styles.liquidLensBadge}>💧 KHÚC XẠ 4K</span>
              </div>
            )}
          </div>
        </div>

        {/* 🎯 ĐIỂM CHẠM VÀO BẢNG ĐIỀU KHIỂN TRÊN GHẾ (ARMREST CONSOLE) */}
        <div
          className={styles.chairConsoleHotspot}
          style={{ left: '45.2%', top: '38.6%' }}
          onClick={handleOpenConsole}
          title="Bấm trực tiếp vào màn hình trên ghế để điều khiển"
        >
          <div className={styles.consolePulseRing} />
          <div className={styles.consoleMarkerBtn}>
            <span className={styles.consoleMarkerIcon}>📱</span>
            <span className={styles.consoleMarkerText}>Ấn Bảng Điều Khiển</span>
          </div>
        </div>

        {/* Các điểm ghim Hotspot thông minh xung quanh chiếc ghế */}
        {CHAIR_HOTSPOTS.filter((s) => !s.isConsole).map((spot) => {
          const isOpen = activeHotspotId === spot.id;
          return (
            <div
              key={spot.id}
              className={`${styles.spotWrapper} ${isOpen ? styles.spotWrapperActive : ''}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={`${styles.spotBtn} ${isOpen ? styles.spotBtnActive : ''}`}
                onClick={() => {
                  playCapacitiveBeep(750);
                  setActiveHotspotId(isOpen ? null : spot.id);
                }}
                title={spot.title}
              >
                <span className={styles.spotDot} />
                <span className={styles.spotPing} />
              </button>

              {isOpen && (
                <div className={`${styles.spotCard} ${spot.y < 35 ? styles.spotCardDown : ''}`}>
                  <div className={styles.spotCardHeader}>
                    <span className={styles.spotCardTitle}>{spot.title}</span>
                    <button
                      type="button"
                      className={styles.spotCloseBtn}
                      onClick={() => setActiveHotspotId(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <p className={styles.spotCardDesc}>{spot.desc}</p>
                  <span className={styles.spotCardTag}>{spot.tag}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ──── CỤM CĂN GIỮA DƯỚI ĐÁY: THÔNG BÁO BẢNG ĐIỀU KHIỂN NẰM TRÊN CÂU CHỈ DẪN ──── */}
      <div className={styles.bottomCenterCluster}>
        <button
          type="button"
          className={styles.quickOpenConsoleBtn}
          onClick={handleOpenConsole}
          title="Mở Bảng điều khiển cảm ứng OLED"
        >
          <div className={styles.quickDockScreen}>
            <span className={styles.quickDockLabel}>BẢNG ĐIỀU KHIỂN TRÊN GHẾ</span>
            <div className={styles.quickDockDigits}>
              <span className={styles.quickDockTemp}>
                {isHeatingOn ? `${tempSetting}°C` : 'OFF'}
              </span>
              <span className={styles.quickDockTherapy}>
                {isHeatingOn ? `🔥 ${activePresetData.name}` : '💤 Chế độ chờ'}
              </span>
            </div>
          </div>
          <span className={styles.quickDockActionBadge}>
            ⚡ Bấm Mở Cảm Ứng 4K
          </span>
        </button>

        <div className={styles.interactionHint}>
          <span>👆</span>
          <span>Chạm vào Bảng điều khiển trên ghế hoặc các điểm nhiệt để khám phá</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          BẢNG ĐIỀU KHIỂN CẢM ỨNG 4K TRỰC TIẾP TRÊN GHẾ (MODAL / CONSOLE WINDOW)
          Mở ra khi khách hàng ấn vào bảng điều khiển trên ghế!
          ═══════════════════════════════════════════════════════════════════════ */}
      {isConsoleModalOpen && (
        <div
          className={styles.consoleModalBackdrop}
          onClick={() => setIsConsoleModalOpen(false)}
        >
          <div
            className={styles.consoleModalWindow}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bảng Điều Khiển */}
            <div className={styles.consoleModalHeader}>
              <div className={styles.consoleModalHeaderLeft}>
                <span className={styles.consoleHeaderBrand}>ALPACA TOUCH • SAPPHIRE OLED 4K</span>
                <h3 className={styles.consoleHeaderTitle}>Bảng Điều Khiển Cảm Ứng Trên Ghế</h3>
              </div>
              <button
                type="button"
                className={styles.consoleCloseBtn}
                onClick={() => {
                  playCapacitiveBeep(600);
                  setIsConsoleModalOpen(false);
                }}
                title="Đóng bảng điều khiển"
              >
                ✕ Thu Gọn
              </button>
            </div>

            {/* Màn hình OLED trung tâm */}
            <div className={styles.oledMainDisplayCard}>
              <div className={styles.oledDisplayStatusRow}>
                <span className={styles.oledSignalBadge}>
                  <span className={`${styles.signalLed} ${isHeatingOn ? styles.signalLedActive : ''}`} />
                  {isHeatingOn ? 'SÓNG FIR 5.6-15µm ĐANG PHÁT XẠ' : 'CHẾ ĐỘ NGHỈ (STANDBY)'}
                </span>
                <span className={styles.oledTimerBadge}>
                  ⏳ {timerSetting}:00 phút
                </span>
              </div>

              <div className={styles.oledDisplayCenterRow}>
                <div className={styles.oledTempContainer}>
                  <span className={styles.oledBigNumber}>
                    {isHeatingOn ? tempSetting : '--'}
                  </span>
                  <span className={styles.oledDegreeUnit}>°C</span>
                </div>

                <div className={styles.oledStatusCluster}>
                  <div className={styles.activeTherapyIndicator}>
                    <span className={styles.indicatorIcon}>{activePresetData.icon}</span>
                    <div className={styles.indicatorInfo}>
                      <span className={styles.indicatorTitle}>{activePresetData.name}</span>
                      <span className={styles.indicatorBadge}>{activePresetData.badge}</span>
                    </div>
                  </div>

                  <div className={styles.firPowerMeter}>
                    <span className={styles.powerMeterLabel}>Cường độ FIR: Mức {firLevel}/5</span>
                    <div className={styles.powerMeterBars}>
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`${styles.meterBar} ${isHeatingOn && lvl <= firLevel ? styles.meterBarActive : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút bấm tăng giảm nhiệt độ cảm ứng */}
              <div className={styles.tempButtonControls}>
                <button
                  type="button"
                  className={styles.tempAdjustBtn}
                  disabled={!isHeatingOn || tempSetting <= 38}
                  onClick={handleTempDown}
                  title="Giảm 1°C"
                >
                  –
                </button>

                {/* Dải nhiệt độ chọn nhanh */}
                <div className={styles.tempQuickPills}>
                  {[39, 41, 43, 46, 48, 50, 52].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      className={`${styles.tempPill} ${tempSetting === deg && isHeatingOn ? styles.tempPillActive : ''}`}
                      onClick={() => {
                        playCapacitiveBeep(950);
                        if (!isHeatingOn) setIsHeatingOn(true);
                        setTempSetting(deg);
                      }}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.tempAdjustBtn}
                  disabled={!isHeatingOn || tempSetting >= 52}
                  onClick={handleTempUp}
                  title="Tăng 1°C"
                >
                  +
                </button>
              </div>
            </div>

            {/* Bật/Tắt 4 vùng phát nhiệt độc lập trên chiếc ghế thật */}
            <div className={styles.zonesSection}>
              <span className={styles.sectionHeading}>ĐIỀU CHỈNH 4 VÙNG NHIỆT ĐỘC LẬP</span>
              <div className={styles.zonesGrid}>
                <button
                  type="button"
                  className={`${styles.zoneBtn} ${activeZones.backrest && isHeatingOn ? styles.zoneBtnActive : ''}`}
                  onClick={() => handleToggleZone('backrest')}
                >
                  <span>♨️ Lưng Ghế (Core)</span>
                  <span className={styles.zoneStateText}>{activeZones.backrest && isHeatingOn ? 'ĐANG PHÁT' : 'TẮT'}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.zoneBtn} ${activeZones.overhead && isHeatingOn ? styles.zoneBtnActive : ''}`}
                  onClick={() => handleToggleZone('overhead')}
                >
                  <span>♨️ Vòm Đỉnh (Cổ & Vai)</span>
                  <span className={styles.zoneStateText}>{activeZones.overhead && isHeatingOn ? 'ĐANG PHÁT' : 'TẮT'}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.zoneBtn} ${activeZones.legs && isHeatingOn ? styles.zoneBtnActive : ''}`}
                  onClick={() => handleToggleZone('legs')}
                >
                  <span>♨️ Bắp Chân & Bàn Chân</span>
                  <span className={styles.zoneStateText}>{activeZones.legs && isHeatingOn ? 'ĐANG PHÁT' : 'TẮT'}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.zoneBtn} ${activeZones.side && isHeatingOn ? styles.zoneBtnActive : ''}`}
                  onClick={() => handleToggleZone('side')}
                >
                  <span>♨️ Mạn Sườn & Tay Vịn</span>
                  <span className={styles.zoneStateText}>{activeZones.side && isHeatingOn ? 'ĐANG PHÁT' : 'TẮT'}</span>
                </button>
              </div>
            </div>

            {/* 4 Phác đồ xông chuyên biệt */}
            <div className={styles.presetSection}>
              <span className={styles.sectionHeading}>CHỌN PHÁC ĐỒ TRỊ LIỆU CHUYÊN SÂU</span>
              <div className={styles.presetGrid}>
                {THERAPY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${styles.presetCard} ${activeTherapy === preset.id ? styles.presetCardActive : ''}`}
                    onClick={() => handleSelectTherapy(preset)}
                  >
                    <div className={styles.presetCardTop}>
                      <span className={styles.presetCardIcon}>{preset.icon}</span>
                      <span className={styles.presetCardTemp}>{preset.temp}°C • {preset.timer}m</span>
                    </div>
                    <span className={styles.presetCardName}>{preset.name}</span>
                    <p className={styles.presetCardDesc}>{preset.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer hành động: Hẹn giờ & Nút nguồn */}
            <div className={styles.consoleModalFooter}>
              <div className={styles.timerPickerCluster}>
                <span className={styles.timerPickerLabel}>Hẹn Giờ Tự Ngắt:</span>
                {[15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`${styles.timerPill} ${timerSetting === mins ? styles.timerPillActive : ''}`}
                    onClick={() => {
                      playCapacitiveBeep(850);
                      setTimerSetting(mins);
                    }}
                  >
                    {mins}p
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`${styles.mainPowerBtn} ${!isHeatingOn ? styles.mainPowerBtnOff : ''}`}
                onClick={handleTogglePower}
              >
                <span>{isHeatingOn ? '🔥 ĐANG XÔNG HƠI (ON)' : '❄️ BẬT XÔNG HƠI (OFF)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
