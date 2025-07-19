import { useState, useEffect } from "react";
import DiaryEntry from "./components/DiaryEntry";
import ChatRoom from "./components/ChatRoom";
import EmotionAnalysis from "./components/EmotionAnalysis";
import Archive from "./components/Archive";
import Login from "./components/Login";

type Screen = 'login' | 'home' | 'diary' | 'chat' | 'emotion' | 'archive';

interface UserData {
  username: string;
  email: string;
  password: string;
  profileImage: string | null;
}

function GenericAvatar({ user }: { user: UserData | null }) {
  return (
    <div
      className="absolute left-[165px] size-[60px] top-[274.852px]"
      data-name="Generic avatar"
    >
      <div className="w-full h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] p-1 shadow-lg">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {user?.profileImage ? (
            <img 
              src={user.profileImage} 
              alt="プロフィール画像" 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 60 60"
            >
              <g id="Generic avatar">
                <rect fill="#6366F1" height="60" rx="30" width="60" />
                <g id="Avatar Placeholder">
                  <path
                    clipRule="evenodd"
                    d="M30 8C22.2683 8 16 14.2683 16 22C16 29.7317 22.2683 36 30 36C37.7317 36 44 29.7317 44 22C44 14.2683 37.7317 8 30 8ZM20 22C20 16.4772 24.4772 12 30 12C35.5228 12 40 16.4772 40 22C40 27.5228 35.5228 32 30 32C24.4772 32 20 27.5228 20 22Z"
                    fill="white"
                    fillRule="evenodd"
                  />
                  <path d="M52 52C52 43.1634 44.8366 36 36 36H24C15.1634 36 8 43.1634 8 52V60H52V52Z" fill="white" />
                </g>
              </g>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
const svgPaths = {
  p3a025180:
    "M109.833 50.1666C111.102 48.8976 112.898 48.8976 114.167 50.1666C115.436 51.4356 115.436 53.2315 114.167 54.5005L65.5002 103.167H50.0002V87.6666L109.833 50.1666Z",
  p34d70400: "M25 18H10M10 18L18 10M10 18L18 26", // これはChatRoomApplicationのBackButton用ですが、参考として含めます
};
function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute top-[480px] left-[20px] w-[165px] h-[152px]">
      <button
        onClick={onClick}
        className="block size-full transition-transform hover:scale-105 active:scale-95" // ホバーとクリック時のアニメーション
        aria-label="日記を書く"
      >
        <svg
          className="block size-full" // SVGが親要素のサイズにフィットするように設定
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 165 153" // SVGのビューボックス。アイコンのサイズに合わせて調整
        >
          <g id="Frame 1">
            {/* ボタンの背景となる円形 */}
            <ellipse
              cx="82.4275"
              cy="76.0741"
              fill="#3B82F6" // 青色の背景
              id="Ellipse 2"
              rx="82.4275"
              ry="76.0741"
            />
            <g id="Edit">
              {/* 日記アイコンのパス */}
              <path
                d={svgPaths.p3a025180} // 日記アイコンのSVGパス
                id="Icon"
                stroke="white" // アイコンの色
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}


function HeartButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute h-[152.148px] left-[205px] top-[479.852px] w-[164.855px]">
      <button 
        onClick={onClick}
        className="block size-full transition-transform hover:scale-105 active:scale-95"
        aria-label="感情記録"
      >
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 165 153"
        >
          <g id="Group 1">
            <ellipse
              cx="82.4275"
              cy="76.0741"
              fill="#EC4899"
              id="Ellipse 1"
              rx="82.4275"
              ry="76.0741"
            />
            <g id="Heart">
              <path
                d="M82.4275 89.5741C82.4275 89.5741 65 76.0741 65 64.5741C65 58.5741 69.9772 53.5741 76 53.5741C78.7614 53.5741 81.2386 55.0741 82.4275 57.5741C83.6164 55.0741 86.0936 53.5741 88.855 53.5741C94.8778 53.5741 99.855 58.5741 99.855 64.5741C99.855 76.0741 82.4275 89.5741 82.4275 89.5741Z"
                id="Icon"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}

function ArchiveButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute h-[152.148px] left-[20.145px] top-[643px] w-[164.855px]">
      <button 
        onClick={onClick}
        className="block size-full transition-transform hover:scale-105 active:scale-95"
        aria-label="アーカイブ"
      >
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 165 153"
        >
          <g id="Frame 3">
            <ellipse
              cx="82.4275"
              cy="76.0741"
              fill="#10B981"
              id="Ellipse 4"
              rx="82.4275"
              ry="76.0741"
            />
            <g id="Archive">
              <path
                d="M62 64.0741H102M62 64.0741V91.0741C62 92.1787 62.8954 93.0741 64 93.0741H100C101.105 93.0741 102 92.1787 102 91.0741V64.0741M62 64.0741L64 60.0741H100L102 64.0741M78 72.0741H86"
                id="Icon"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}

function MessageButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute h-[152.148px] left-[205px] top-[643px] w-[164.855px]">
      <button 
        onClick={onClick}
        className="block size-full transition-transform hover:scale-105 active:scale-95"
        aria-label="メッセージ"
      >
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 165 153"
        >
          <g id="Frame 4">
            <ellipse
              cx="82.4275"
              cy="76.0741"
              fill="#8B5CF6"
              id="Ellipse 3"
              rx="82.4275"
              ry="76.0741"
            />
            <g id="Message circle">
              <path
                d="M60 76.0741C60 63.7741 69.9497 53.8244 82.2527 53.8244H82.6023C94.9053 53.8244 104.855 63.7741 104.855 76.0741V76.4237C104.855 88.7267 94.9053 98.6764 82.6023 98.6764H68.4275L60 107.074V76.0741Z"
                id="Icon"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}

function ProfileButton({ onClick, user }: { onClick: () => void; user: UserData | null }) {
  return (
    <div className="absolute contents left-[135px] top-[340px]">
      <button
        onClick={onClick}
        className="absolute bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] transition-all duration-200 h-[33px] left-[135px] rounded-[28px] top-[340px] w-[125px] shadow-lg hover:shadow-xl transform hover:scale-105"
        aria-label="プロフィールの変更"
      />
      <div
        className="absolute font-bold leading-[0] left-[146px] text-white text-[11px] text-left text-nowrap top-[350px] tracking-[0.55px] pointer-events-none"
      >
        <p className="block leading-[normal] whitespace-pre">
          {user?.username || 'プロフィール'}
        </p>
      </div>
    </div>
  );
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute contents left-[135px] top-[377px]">
      <button
        onClick={onClick}
        className="absolute bg-gradient-to-r from-[#EF4444] to-[#F59E0B] hover:from-[#DC2626] hover:to-[#D97706] transition-all duration-200 h-[33px] left-[135px] rounded-[28px] top-[377px] w-[125px] shadow-lg hover:shadow-xl transform hover:scale-105"
        aria-label="ログアウト"
      />
      <div
        className="absolute font-bold leading-[0] left-[170px] text-white text-[11px] text-left text-nowrap top-[387px] tracking-[0.55px] pointer-events-none"
      >
        <p className="block leading-[normal] whitespace-pre">
          ログアウト
        </p>
      </div>
    </div>
  );
}

//ホーム画面
function HomeScreen({ onNavigate, user }: { onNavigate: (action: string) => void; user: UserData | null }) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleButtonClick = (action: string) => {
    setSelectedAction(action);
    if (action === '日記作成') {
      onNavigate('diary');
    } else if (action === 'メッセージ') {
      onNavigate('chat');
    } else if (action === '感情記録') {
      onNavigate('emotion');
    } else if (action === 'アーカイブ') {
      onNavigate('archive');
    } else if (action === 'ログアウト') {
      onNavigate('logout');
    } else {
      console.log(`${action} ボタンがクリックされました`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] relative size-full" data-name="ホーム画面">
      <div
        className="absolute font-bold h-[81px] leading-[0] left-[68px] text-transparent bg-gradient-to-r from-[#6366F1] to-[#EC4899] bg-clip-text text-[50px] text-left top-[99px] tracking-[2.5px] w-[292px]"
      >
        <p className="block leading-[normal]">
          Welcome{user?.username && `, ${user.username}`}！
        </p>
      </div>
      
      <GenericAvatar user={user} />
      <EditButton onClick={() => handleButtonClick('日記作成')} />
      <HeartButton onClick={() => handleButtonClick('感情記録')} />
      <ArchiveButton onClick={() => handleButtonClick('アーカイブ')} />
      <MessageButton onClick={() => handleButtonClick('メッセージ')} />
      <ProfileButton onClick={() => handleButtonClick('プロフィール変更')} user={user} />
      <LogoutButton onClick={() => handleButtonClick('ログアウト')} />
      
      {selectedAction && !['日記作成', 'メッセージ', '感情記録', 'アーカイブ', 'ログアウト'].includes(selectedAction) && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border-l-4 border-[#6366F1]">
          <p className="text-sm text-gray-700">{selectedAction} 機能が選択されました</p>
        </div>
      )}
    </div>
  );
}

// アプリの中心
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    // ローカルストレージからユーザー情報を取得
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentScreen('home');
    }
  }, []);

  const handleLogin = (userData: UserData) => {
    setCurrentUser(userData);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const handleNavigation = (screen: string) => {
    if (screen === 'logout') {
      handleLogout();
    } else if (screen === 'diary') {
      setCurrentScreen('diary');
    } else if (screen === 'chat') {
      setCurrentScreen('chat');
    } else if (screen === 'emotion') {
      setCurrentScreen('emotion');
    } else if (screen === 'archive') {
      setCurrentScreen('archive');
    }
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="relative size-full min-h-screen">
      {currentScreen === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      {currentScreen === 'home' && (
        <HomeScreen onNavigate={handleNavigation} user={currentUser} />
      )}
      {currentScreen === 'diary' && (
        <DiaryEntry onBack={handleBackToHome} />
      )}
      {currentScreen === 'chat' && (
        <ChatRoom onBack={handleBackToHome} />
      )}
      {currentScreen === 'emotion' && (
        <EmotionAnalysis onBack={handleBackToHome} />
      )}
      {currentScreen === 'archive' && (
        <Archive onBack={handleBackToHome} />
      )}
    </div>
  );
}