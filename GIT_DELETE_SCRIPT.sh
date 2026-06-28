#!/bin/bash

# ====================================
# 이룸 AI DDS - 불필요한 이미지 파일 삭제 스크립트
# ====================================

echo "🚀 Git CLI 일괄 삭제 스크립트 시작..."
echo ""

# 1. 저장소 클론
echo "📥 Step 1: 저장소 클론 중..."
cd ~/Documents
mkdir -p GitHub
cd GitHub

if [ -d "eruso" ]; then
    echo "⚠️  eruso 폴더가 이미 존재합니다. 기존 폴더 사용..."
    cd eruso
    git pull origin main
else
    git clone https://github.com/choyeon5901-cell/eruso.git
    cd eruso
fi

echo "✅ 저장소 준비 완료!"
echo ""

# 2. 현재 위치 확인
echo "📍 현재 위치: $(pwd)"
echo ""

# 3. 파일 삭제
echo "🗑️  Step 2: 불필요한 이미지 파일 삭제 중..."
echo ""

# 삭제할 파일 목록
files_to_delete=(
    "images/about-real-medical-lab.jpg"
    "images/medical-equipment-modern.jpg"
    "images/about-ultra-hq-ai-healthcare.jpg"
    "images/hero-ai-healthcare-illustration.jpg"
    "images/smart-health-tech-gentle.jpg"
    "images/pharmacy-minimal-illustration.jpg"
    "images/hero-healthcare-delivery.jpg"
    "images/pharmacist-friendly.jpg"
    "images/pharmacy-professional.jpg"
    "images/pharmacy-modern-clean.jpg"
    "images/korea-pharmacy-interior.jpg"
    "images/korea-pharmacy-delivery.jpg"
    "images/pharmacy-modern-korea.jpg"
    "images/smart-city-neon-future.jpg"
    "images/hero-future-drone-city.jpg"
    "images/future-ai-healthcare.jpg"
    "images/hero-ultra-hq-future-city.jpg"
    "images/city-modern-skyline.jpg"
    "images/hero-real-city-sunset.jpg"
    "images/smart-healthcare-soft.jpg"
    "images/hero-drone-modern.jpg"
    "images/drone-sky-blue.jpg"
    "images/smart-city-futuristic.jpg"
    "images/smart-city-tech.jpg"
)

# 각 파일 삭제
deleted_count=0
for file in "${files_to_delete[@]}"; do
    if [ -f "$file" ]; then
        git rm "$file"
        echo "  ✅ 삭제: $file"
        ((deleted_count++))
    else
        echo "  ⚠️  파일 없음: $file"
    fi
done

echo ""
echo "📊 삭제 완료: $deleted_count 개 파일"
echo ""

# 4. 변경사항 확인
echo "📝 Step 3: 변경사항 확인..."
git status
echo ""

# 5. 커밋
echo "💾 Step 4: 커밋 중..."
git commit -m "불필요한 이미지 파일 ${deleted_count}개 삭제

- 이전 버전 의료/약국 이미지 제거
- 사용하지 않는 히어로 섹션 이미지 제거
- 저장소 용량 최적화

삭제된 파일:
$(printf '  - %s\n' "${files_to_delete[@]}")
"

echo "✅ 커밋 완료!"
echo ""

# 6. Push
echo "🚀 Step 5: GitHub에 Push 중..."
echo ""
echo "⚠️  GitHub 인증 정보 입력 필요:"
echo "   Username: choyeon5901-cell"
echo "   Password: [Personal Access Token]"
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ========================================="
    echo "🎉 성공! 모든 작업이 완료되었습니다!"
    echo "🎉 ========================================="
    echo ""
    echo "📊 삭제된 파일: $deleted_count 개"
    echo "🔗 GitHub: https://github.com/choyeon5901-cell/eruso"
    echo "🌐 웹사이트: https://www.eruso.co.kr"
    echo ""
    echo "⏱️  Cloudflare Pages 자동 배포: 2~3분 소요"
    echo "🔄 캐시 삭제 권장: Ctrl+Shift+Delete (브라우저)"
    echo ""
else
    echo ""
    echo "❌ Push 실패! 인증 정보를 확인하세요."
    echo ""
    echo "📖 Personal Access Token 생성:"
    echo "   https://github.com/settings/tokens"
    echo ""
fi
