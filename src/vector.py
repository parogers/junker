import math

class vector(object):
    def __init__(this, x=0, y=0):
        this.x = x
        this.y = y

    def __len__(this):
        return 2

    def __getitem__(this, n):
        if (n == 0): return this.x
        elif (n == 1): return this.y
        raise IndexError()

    def __add__(this, other):
        return vector(this.x+other.x, this.y+other.y)

    def __sub__(this, other):
        return this + (-other)

    def __neg__(this):
        return vector(-this.x, -this.y)

    def __str__(this):
        return "<%s,%s>" % (this.x, this.y)

    def __mul__(this, other):
        return vector(this.x*other, this.y*other)

    def __rmul__(this, other):
        return this*other

    def __div__(this, other):
        return this*(1.0/other)

    def __abs__(this):
        return math.sqrt(this.x**2+this.y**2)

    def unit(this):
        mag = abs(this)
        if (mag == 0):
            return vector(0,0)
        return this/mag

    def toint(this):
        return vector(int(this.x), int(this.y))

    @property
    def angle(this):
        return math.degrees(math.atan2(this.y, this.x))

    @staticmethod
    def from_angle(angle):
        v = vector()
        v.x = math.cos(math.radians(angle))
        v.y = math.sin(math.radians(angle))
        return v

