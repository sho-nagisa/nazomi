import { useState, useEffect } from "react";
import DiaryEntry from "./components/DiaryEntry";
import ChatRoom from "./components/ChatRoom";
import EmotionAnalysis from "./components/EmotionAnalysis";
import Archive from "./components/Archive";
import Login from "./components/Login";



type Screen = 'login' | 'home' | 'diary' | 'chat' | 'emotion' | 'archive' | 'profile';

interface UserData {
  username: string;
  email: string;
  password: string;
  profileImage: string | null;
}

// 画像パスの設定
const backgroundImages = {
  diary: '../public/assets/notebook.jpg', // ペンの画像
  chat: '../public/assets/chat.jpg',   // 会話の画像
  emotion: '../public/assets/wordcloud.jpg', // ワードクラウド画像
  archive: '../public/assets/history.jpg'    // 本の画像
};

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-6 left-6 z-10 bg-black/20 backdrop-blur-sm rounded-full p-3 hover:bg-black/30 transition-all duration-200 group"
      aria-label="ログアウト"
    >
      <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  );
}

function UserProfileButton({ user, onClick }: { user: UserData | null; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-6 right-6 z-10 bg-black/20 backdrop-blur-sm rounded-full p-2 hover:bg-black/30 transition-all duration-200 group flex items-center space-x-3"
      aria-label="プロフィール"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-0.5">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="プロフィール画像"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>
      {/* 700px以下で非表示にする */}
      <span className="text-white font-medium pr-2 hidden md:inline group-hover:scale-105 transition-transform">
        {user?.username || 'User'}
      </span>
    </button>
  );
}

function MenuCard({
  title,
  backgroundImage,
  onClick,
  className = ""
}: {
  title: string;
  backgroundImage: string;
  onClick: () => void;
  className?: string;
}) {
  // 各カードに異なるグラデーションカラーを設定
  const getGradientOverlay = (title: string) => {
    switch (title) {
      case 'Daialy':
        return 'bg-gradient-to-br from-emerald-500/70 via-orange-600/60 to-cyan-700/50';
      case 'Chat':
        return 'bg-gradient-to-br from-violet-500/70 via-pink-600/60 to-indigo-700/50';
      case 'WordCloud':
        return 'bg-gradient-to-br from-rose-500/70 via-purple-600/60 to-red-700/50';
      case 'History':
        return 'bg-gradient-to-br from-amber-500/70 via-blue-600/60 to-yellow-700/50';
      default:
        return 'bg-gradient-to-br from-slate-500/70 via-gray-600/60 to-zinc-700/50';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl h-48 transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* ぼかし効果のための背景画像レイヤー */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* カラーグラデーションオーバーレイ */}
      <div className={`absolute inset-0 ${getGradientOverlay(title)} group-hover:opacity-30 transition-all duration-300`} />

      {/* 追加の深みのためのオーバーレイ */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />

      {/* タイトル */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h2 className="text-white text-4xl font-bold tracking-wider transform group-hover:scale-110 transition-all duration-300 drop-shadow-lg">
          {title}
        </h2>
      </div>

      {/* ホバー時の光沢効果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}

function ProfileModal({ user, onClose }: { user: UserData | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">プロフィール</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-1 mx-auto mb-4">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="プロフィール画像"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
            <p className="text-lg text-gray-900">{user?.username || 'Unknown User'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <p className="text-lg text-gray-900">{user?.email || 'No email provided'}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

// ホーム画面
// ホーム画面
function HomeScreen({ onNavigate, user }: { onNavigate: (action: string) => void; user: UserData | null }) {
  const [showProfile, setShowProfile] = useState(false);

  const handleMenuClick = (screen: string) => {
    onNavigate(screen);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleLogoutClick = () => {
    onNavigate('logout');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50 flex flex-col">
      {/* 拡張されたナビゲーションヘッダー */}
      <div className="relative h-32 flex-shrink-0">
        <LogoutButton onClick={handleLogoutClick} />
        <UserProfileButton user={user} onClick={handleProfileClick} />

        {/* ウェルカムメッセージ*/}
        <div className="flex items-center justify-center h-full px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Welcome{user?.username && `, ${user.username}`}!
            </h1>
            <p className="text-gray-600 text-sm">
              今日も素敵な一日を記録しましょう
            </p>
          </div>
        </div>
      </div>

      {/* マージンを持つフルスクリーンメニューカード */}
      <div className="flex-1 flex flex-col px-4 pb-4 space-y-2">
        <MenuCard
          title="Diary"
          backgroundImage={backgroundImages.diary}
          onClick={() => handleMenuClick('diary')}
          className="flex-1 rounded-lg"
        />

        <MenuCard
          title="Chat"
          backgroundImage={backgroundImages.chat}
          onClick={() => handleMenuClick('chat')}
          className="flex-1 rounded-lg"
        />

        <MenuCard
          title="WordCloud"
          backgroundImage={backgroundImages.emotion}
          onClick={() => handleMenuClick('emotion')}
          className="flex-1 rounded-lg"
        />

        <MenuCard
          title="History"
          backgroundImage={backgroundImages.archive}
          onClick={() => handleMenuClick('archive')}
          className="flex-1 rounded-lg"
        />
      </div>

      {/* プロフィールモーダル */}
      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

// アプリの中心
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    // メモリ内のユーザー情報を確認（ここでは実際のlocalStorageは使用できないため、デモ用のユーザーを設定）
    const demoUser: UserData = {
      username: "Demo User",
      email: "demo@example.com",
      password: "demo123",
      profileImage: null
    };

    setCurrentUser(demoUser);
    setCurrentScreen('home');
  }, []);

  const handleLogin = (userData: UserData) => {
    setCurrentUser(userData);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
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
    } else if (screen === 'profile') {
      setCurrentScreen('profile');
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