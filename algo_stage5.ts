import { Lesson } from './types';

export const algo_stage5: Lesson = {
  id: 'tut5',
  title: 'STAGE 5. 선택하기',
  description: '컴퓨터가 상황에 따라 다른 행동을 하게 만드는 개념을 이해합니다.',
  category: 'tutorial',
  status: 'locked',
  pages: [
    {
      id: 'tut5_p1',
      title: '선택이란?',
      content:
        '모든 프로그램에는 선택이 있습니다.\n상황이 다르면, 결과도 달라집니다.\n\n이런 판단을 우리는 “선택”이라고 부릅니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    },
    {
      id: 'tut5_p2',
      title: '맞다 / 아니다',
      content:
        '컴퓨터는 질문에 대해\n“맞다” 또는 “아니다”로만 판단합니다.\n\n이 판단에 따라\n다른 행동을 하게 됩니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    }
  ],

  conceptProblems: [
    {
      id: 'tut5_c1',
      question: 'Q. 프로그램에서 “선택”이 필요한 이유는 무엇일까요?',
      options: [
        '코드를 길게 만들기 위해서',
        '상황에 따라 다른 결과를 만들기 위해서',
        '컴퓨터 속도를 높이기 위해서',
        '출력을 예쁘게 하기 위해서'
      ],
      answer: '상황에 따라 다른 결과를 만들기 위해서',
      hint: '같은 입력이라도 상황이 다를 수 있습니다.',
      explanation:
        '선택이 있어야 프로그램이 상황에 맞게 다르게 동작할 수 있습니다.',
      type: 'concept'
    }
  ],

  codingProblems: []
};
