class ProcessingResult:

    def __init__(self):
        self.timesteps = []
        self.pitch_contour = []
        self.rate_contour = []
        self.width_contour = []

    def serialize(self):
        return {
            "timesteps": self.timesteps,
            "pitchContour": self.pitch_contour,
            "rateContour": self.rate_contour,
            "widthContour": self.width_contour
        }


def process(audio_file):
    '''
    Processes an audio file and returns a pitch contour, a rate contour, and a width contour.
    :param audio_file:
    :return: ProcessingResult
    '''
    result = ProcessingResult()
    return result
