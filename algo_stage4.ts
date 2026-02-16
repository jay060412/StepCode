import { Lesson } from './types';

export const algo_stage4: Lesson = {
  id: 'tut4',
  title: 'STAGE 4. 생각하게 하기',
  description: '컴퓨터가 값을 가지고 계산하고 판단하는 개념을 이해합니다.',
  category: 'tutorial',
  status: 'locked',
  pages: [
    {
      id: 'tut4_p1',
      title: '컴퓨터는 생각을 할까?',
      content:
        '컴퓨터는 사람처럼 생각하지는 못합니다.\n하지만 우리가 정해준 규칙대로 계산은 할 수 있습니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    },
    {
      id: 'tut4_p2',
      title: '숫자와 글자의 차이',
      content:
        '컴퓨터에게 숫자는 계산 대상이고,\n글자는 계산이 아닌 “붙이기 대상”입니다.\n\n그래서 같은 모양이라도 결과가 달라질 수 있습니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    }
  ],

  conceptProblems: [
    {
      id: 'tut4_c1',
      question: 'Q. 컴퓨터가 할 수 있는 “생각”에 가장 가까운 것은?',
      options: [
        '기분을 느끼는 것',
        '상황을 눈치로 판단하는 것',
        '정해진 규칙대로 계산하는 것',
        '스스로 목표를 세우는 것'
      ],
      answer: '정해진 규칙대로 계산하는 것',
      hint: '컴퓨터는 규칙에 아주 강합니다.',
      explanation:
        '컴퓨터는 감정이나 판단 대신, 우리가 준 규칙에 따라 계산합니다.',
      type: 'concept'
    }
  ],

  codingProblems: []
};
