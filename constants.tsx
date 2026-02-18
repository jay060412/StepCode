
import React from 'react';
import { LayoutGrid, BookOpen, ShieldAlert, History, Code2, Compass, MessageCircleQuestion, Settings as SettingsIcon, Megaphone } from 'lucide-react';
import { AppRoute } from './types';

export const NAV_ITEMS = [
  { id: AppRoute.HOME, label: '홈', icon: <LayoutGrid size={20} /> },
  { id: AppRoute.NOTICE, label: '공지사항', icon: <Megaphone size={20} /> },
  { id: AppRoute.STUDY_GUIDE, label: '공부방법', icon: <Compass size={20} /> },
  { id: AppRoute.CURRICULUM, label: '커리큘럼', icon: <BookOpen size={20} /> },
  { id: AppRoute.PLAYGROUND, label: '코딩 연습장', icon: <Code2 size={20} /> },
  { id: AppRoute.QUESTION, label: '질문하기', icon: <MessageCircleQuestion size={20} /> },
  { id: AppRoute.GAP_FILLER, label: '빈틈 매우기', icon: <History size={20} /> },
  { id: AppRoute.SETTINGS, label: '설정', icon: <SettingsIcon size={20} /> },
  { id: AppRoute.ADMIN, label: '관리자', icon: <ShieldAlert size={20} /> },
];
