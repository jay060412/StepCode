
import { Track } from './types';

export const cBasicTrack: Track = {
  id: 'c_basic',
  title: 'C언어 기초',
  description: '컴퓨터의 구조와 메모리를 이해하며 C언어의 기초를 다집니다.',
  category: 'language',
  iconType: 'c',
  lessons: [
    {
      id: 'c1',
      title: 'Hello C!',
      description: 'C언어의 기본 구조를 이해합니다.',
      category: 'language',
      status: 'current',
      pages: [],
      conceptProblems: [],
      codingProblems: []
    }
  ]
};
