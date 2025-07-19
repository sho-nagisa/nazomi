import { useState } from "react";
import { supabase } from "../lib/supabaseClient.ts"; // パスは実際のプロジェクトに合わせてください

interface UserData {
  id?: string;
  username: string;
  email: string;
  password: string;
  profileImage: string | null;
}

function InputField({
  type,
  placeholder,
  value,
  onChange,
  icon
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
      <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start px-4 py-3 relative shrink-0 w-full bg-white border border-gray-200 rounded-xl focus-within:border-[#6366F1] focus-within:ring-2 focus-within:ring-[#6366F1]/20 transition-all duration-200 shadow-sm">
        {icon && <div className="shrink-0">{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="basis-0 font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

function ProfileImageSelector({
  selectedImage,
  onImageSelect
}: {
  selectedImage: string | null;
  onImageSelect: (image: string | null) => void;
}) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] p-1 shadow-lg">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="プロフィール画像"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>
        </div>
        <label
          htmlFor="profileImage"
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#EC4899] to-[#F59E0B] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </label>
        <input
          id="profileImage"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      <p className="text-[#6B7280] text-[12px] text-center">
        プロフィール画像を選択してください
      </p>
    </div>
  );
}

function ActionButton({
  onClick,
  children,
  disabled = false,
  variant = 'primary'
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const baseClasses = "w-full py-3 px-6 rounded-xl transition-all duration-200 transform shadow-lg";
  const primaryClasses = "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] text-white hover:scale-105 hover:shadow-xl";
  const secondaryClasses = "bg-gradient-to-r from-[#10B981] to-[#3B82F6] hover:from-[#059669] hover:to-[#2563EB] text-white hover:scale-105 hover:shadow-xl";
  const disabledClasses = "bg-gray-400 text-gray-600 cursor-not-allowed";

  const classes = disabled
    ? `${baseClasses} ${disabledClasses}`
    : `${baseClasses} ${variant === 'primary' ? primaryClasses : secondaryClasses}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      <div className="font-semibold text-[16px]">
        {children}
      </div>
    </button>
  );
}

export default function Login({ onLogin }: { onLogin: (userData: UserData) => void }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    username: '',
    email: '',
    password: '',
    profileImage: null
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }

    if (isRegisterMode && !formData.username) {
      alert('ユーザー名を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // まず同じメールアドレスのユーザーが存在するかチェック
        const { data: existingUsers, error: checkError } = await supabase
          .from('user_info')  // テーブル名を修正
          .select('email')
          .eq('email', formData.email);

        if (checkError) {
          console.error('Check error:', checkError);
          alert('エラーが発生しました: ' + checkError.message);
          return;
        }

        if (existingUsers && existingUsers.length > 0) {
          alert('このメールアドレスは既に登録されています');
          return;
        }

        // Supabase にユーザー登録（カラム名を確認して調整）
        const insertData: {
          username: string;
          email: string;
          password: string;
          profile_image?: string | null;
        } = {
          username: formData.username,
          email: formData.email,
          password: formData.password, // 本番ではハッシュ化必須！
          profile_image: formData.profileImage
        };

        console.log('Inserting data:', insertData); // デバッグ用

        const { data, error } = await supabase
          .from('user_info')
          .insert(insertData)
          .select(); // 挿入したデータを返すようにする

        if (error) {
          console.error('Insert error:', error);
          alert('登録に失敗しました: ' + error.message);
          return;
        }

        const newUser = data[0];
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        console.log('ユーザー登録完了:', newUser);
        onLogin(newUser);
      } else {
        // Supabase でログイン処理
        const { data: users, error } = await supabase
          .from('user_info')  // テーブル名を修正
          .select('*')
          .eq('email', formData.email)
          .eq('password', formData.password); // 本番ではハッシュ化したパスワードで比較

        if (error) {
          console.error('Login error:', error);
          alert('ログインエラー: ' + error.message);
          return;
        }

        if (!users || users.length === 0) {
          alert('メールアドレスまたはパスワードが間違っています');
          return;
        }

        const user = users[0];
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('ログイン成功:', user);
        onLogin(user);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setFormData({
      username: '',
      email: '',
      password: '',
      profileImage: null
    });
  };

  const isFormValid = formData.email && formData.password && (!isRegisterMode || formData.username);

  return (
    <div className="relative size-full min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]" data-name="ログイン画面">
      <div className="flex items-center justify-center min-h-full px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="font-bold text-transparent bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#8B5CF6] bg-clip-text text-[32px] tracking-[1.6px] mb-2">
                <p className="block leading-[normal]">
                  {isRegisterMode ? 'アカウント作成' : 'ログイン'}
                </p>
              </div>
              <p className="text-[#6B7280] text-[14px]">
                {isRegisterMode ? '新しいアカウントを作成します' : 'アカウントにログインします'}
              </p>
            </div>

            {/* Profile Image Selector (Register mode only) */}
            {isRegisterMode && (
              <div className="mb-6">
                <ProfileImageSelector
                  selectedImage={formData.profileImage}
                  onImageSelect={(image) => setFormData({ ...formData, profileImage: image })}
                />
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              {isRegisterMode && (
                <InputField
                  type="text"
                  placeholder="ユーザー名"
                  value={formData.username}
                  onChange={(value) => setFormData({ ...formData, username: value })}
                  icon={
                    <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
              )}

              <InputField
                type="email"
                placeholder="メールアドレス"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                icon={
                  <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <InputField
                type="password"
                placeholder="パスワード"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                icon={
                  <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
            </div>

            {/* Action Button */}
            <div className="mb-6">
              <ActionButton
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? '処理中...' : (isRegisterMode ? 'アカウント作成' : 'ログイン')}
              </ActionButton>
            </div>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                onClick={toggleMode}
                disabled={isLoading}
                className="text-[#6366F1] hover:text-[#5B21B6] font-medium text-[14px] transition-colors duration-200 disabled:opacity-50"
              >
                {isRegisterMode
                  ? 'すでにアカウントをお持ちですか？ ログイン'
                  : 'アカウントをお持ちでない方はこちら'}
              </button>
            </div>

            {/* Forgot Password (Login mode only) */}
            {!isRegisterMode && (
              <div className="text-center mt-4">
                <button className="text-[#6B7280] hover:text-[#374151] font-normal text-[12px] transition-colors duration-200">
                  パスワードを忘れた方はこちら
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}