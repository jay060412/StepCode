
import { Track } from './types';
import { algo_stage1 } from './algo_stage1';
import { algo_stage2 } from './algo_stage2';
import { algo_stage3 } from './algo_stage3';
import { algo_stage4 } from './algo_stage4';
import { algo_stage5 } from './algo_stage5';
import { algo_stage6 } from './algo_stage6';

export const algorithmTrack: Track = {
  id: 'algo_tutorial',
  title: '알고리즘 사고력',
  description: '문제를 논리적으로 쪼개고 해결책을 설계하는 사고 방식을 배웁니다.',
  category: 'tutorial',
  iconType: 'algorithm',
  lessons: [
    algo_stage1,
    algo_stage2,
    algo_stage3,
    algo_stage4,
    algo_stage5,
    algo_stage6,
    {
      id: 'algo_complete',
      title: 'Tutorial Completed! 🎉',
      description: '축하합니다! 사고력 트랙의 모든 과정을 마쳤습니다.',
      category: 'tutorial',
      status: 'locked',
      pages: [
        {
          id: 'a_finish',
          title: '사고력 과정을 마치며',
          content:
            '이제 여러분은 논리적으로 문제를 정의하고 해결하는 법을 익혔습니다.\n실제 파이썬 트랙에서 이 논리를 코드로 구현해보세요!',
          code:
            'print("Algorithm Master Ready!")',
          exampleOutput:
            'Algorithm Master Ready!',
          traceFlow: [0],
          variableHistory: [{}],
          explanations: []
        }
      ],
      conceptProblems: [],
      codingProblems: []
    }
  ]
};
