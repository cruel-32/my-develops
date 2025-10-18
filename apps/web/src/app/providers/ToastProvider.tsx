'use client';
import { Toaster } from '@/web/shared/ui';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      expand={false} // 호버 시 확장 여부
      richColors // 풍부한 색상 사용
      closeButton // X 닫기 버튼 표시
      offset="20px" // 화면 가장자리로부터 거리
    />
  );
}
